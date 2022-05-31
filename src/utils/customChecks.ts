import { OrdersType } from '../schema';
import { mongodb } from './';

const Orders = mongodb.models['orders'];

async function noOrderForFarmer(farmer: string): Promise<boolean> {
    const getIfFFarmerIsFarmingOrNot: OrdersType | null = await Orders.findOne({ farmerid: farmer });
    return getIfFFarmerIsFarmingOrNot !== null;
}


export {
    noOrderForFarmer,
}