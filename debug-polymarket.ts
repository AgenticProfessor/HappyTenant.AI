
import { PolymarketService } from './src/lib/intelligence/polymarket';

async function main() {
    console.log('Fetching Fed Decision Prediction...');
    const prediction = await PolymarketService.getFedDecisionInDecemberPrediction();
    console.log('Prediction Result:', JSON.stringify(prediction, null, 2));
}

main().catch(console.error);
