import { AnifarmType, OrdersType } from '../schema';
import { mongodb, profiledb } from './';

const Orders = mongodb.models['orders'];
const Profile = profiledb.models['anifarm'];

async function noOrderForFarmer(farmer: string): Promise<boolean> {
    const getIfFFarmerIsFarmingOrNot: OrdersType | null = await Orders.findOne({ farmerid: farmer });
    return getIfFFarmerIsFarmingOrNot !== null;
}

async function getUserProfile(userId: string): Promise<AnifarmType | null> {
    const userProfile: AnifarmType | null = await Profile.findById(userId);
    return userProfile;
}


export {
    noOrderForFarmer,
    getUserProfile
}