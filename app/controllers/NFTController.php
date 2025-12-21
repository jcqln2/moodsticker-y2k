<?php
// app/controllers/NFTController.php
// Handles NFT minting requests

class NFTController extends Controller {
    
    private $nftModel;
    private $stickerModel;
    
    public function __construct() {
        $this->nftModel = $this->model('NFT');
        $this->stickerModel = $this->model('Sticker');
    }
    
    // POST /api/nft/mint - Initiate NFT minting
    public function mint() {
        $this->validateMethod(['POST']);
        
        try {
            // Get JSON input
            $input = $this->getJsonInput();
            
            // Validate required fields
            if (!isset($input['sticker_id']) || !isset($input['wallet_address']) || !isset($input['blockchain'])) {
                $this->errorResponse('sticker_id, wallet_address, and blockchain are required', 400);
            }
            
            // Validate blockchain
            if (!in_array($input['blockchain'], ['lukso', 'polygon'])) {
                $this->errorResponse('blockchain must be either "lukso" or "polygon"', 400);
            }
            
            // Verify sticker exists
            $sticker = $this->stickerModel->find($input['sticker_id']);
            if (!$sticker) {
                $this->errorResponse('Sticker not found', 404);
            }
            
            // Check if already minted
            if ($this->nftModel->isStickerMinted($input['sticker_id'])) {
                $this->errorResponse('This sticker has already been minted as an NFT', 400);
            }
            
            // Sanitize input
            $mintData = [
                'sticker_id' => (int)$input['sticker_id'],
                'wallet_address' => $this->sanitize($input['wallet_address']),
                'blockchain' => $this->sanitize($input['blockchain'])
            ];
            
            // Create mint record
            $mintId = $this->nftModel->createMintRecord($mintData);
            
            if (!$mintId) {
                $this->errorResponse('Failed to create mint record', 500);
            }
            
            // In a real implementation, this would trigger the actual blockchain minting
            // For now, we'll simulate it with a status update
            
            // TODO: Integrate with LUKSO/Polygon blockchain
            // - Upload metadata to IPFS
            // - Call smart contract mint function
            // - Get transaction hash and token ID
            
            // Get the created NFT record
            $nft = $this->nftModel->getNFTWithDetails($mintId);
            
            $this->successResponse([
                'nft' => $nft,
                'message' => 'NFT minting initiated. This is a simulation - blockchain integration pending.',
                'next_steps' => [
                    'status' => 'pending',
                    'blockchain' => $input['blockchain'],
                    'note' => 'In production, this would trigger actual blockchain minting'
                ]
            ], 'Mint request created successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/nft/{id} - Get NFT details
    public function show($id) {
        try {
            $nft = $this->nftModel->getNFTWithDetails($id);
            
            if (!$nft) {
                $this->errorResponse('NFT not found', 404);
            }
            
            $this->successResponse($nft);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/nft/wallet/{address} - Get NFTs by wallet
    public function wallet($address) {
        try {
            $address = $this->sanitize($address);
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            
            $nfts = $this->nftModel->getNFTsByWallet($address, $limit);
            
            $this->successResponse([
                'wallet_address' => $address,
                'nfts' => $nfts,
                'count' => count($nfts)
            ]);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/nft/pending - Get pending mints
    public function pending() {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
            $pendingMints = $this->nftModel->getPendingMints($limit);
            
            $this->successResponse([
                'pending_mints' => $pendingMints,
                'count' => count($pendingMints)
            ]);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/nft/stats - Get NFT statistics
    public function stats() {
        try {
            $stats = $this->nftModel->getStatistics();
            
            $this->successResponse($stats, 'NFT statistics retrieved');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
}
