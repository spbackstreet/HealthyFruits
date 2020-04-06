import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css 
import { postApiCall } from '../commom/ApiRouter';
import config from '../config';

const getPoiList = async (pincode) => {
    const Request = {

        "pincode": pincode,
        "guid": config.guid,
    };
    console.log("Request : ", Request)
    const APIURL = `${process.env.REACT_APP_API_URL}/AuthenticationAndAuthorization/GetPOAPOIMaster`;
    try {
        const response = await postApiCall(Request, APIURL);
        return response;

    } catch (error) {
        console.error(error);
    }

}

export default getPoiList;