import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css 
import { postApiCall } from '../commom/ApiRouter';
import config from '../config';
import CAFRequest from "../txnUploadData/cafRequest"
import GlobalPOIModel from '../Model/POIModel';
import GlobalPOAModel from '../Model/POAModel';
import { apiCall } from '../commom/commonApiCalling';

const dayDeDupeService = async (Request) => {
    
    console.log("Request : ", Request)
    const  service =apiCall("DayDedupe")
    const  name=service.MICROSERVICENAME
    const  url=service.ZONEURL
    const APIURL = `${url}${name}`;

    // const APIURL = "https://devfin.ril.com:8443/HealthService/getLiveNess";

    try {
        const response = await postApiCall(Request, APIURL);
        return response;

    } catch (error) {
        console.error(error);
    }

}

export default dayDeDupeService;