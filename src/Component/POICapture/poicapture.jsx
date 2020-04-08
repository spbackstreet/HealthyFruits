import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FixedHeader } from '../../commom/FixedHeader';
import getpoilist from '../../services/getpoilist';
import Spinner from 'react-spinner-material';
import OtpDialogue from '../OtpDialogue/OtpDialogue';
import '../../css/style.css';
import useLoader from '../../hooks/useLoader';
import config from '../../config';
import { getValueFromAuthConfigList, logout, showErrorAlert } from '../../commom/commonMethod';
import useGlobalState from '../../hooks/useGlobalState';
import { storeSelectedDocObject, storeListPOA } from '../../action';
import { confirmAlert } from 'react-confirm-alert';
import { getHypervergeErrorMessage, getCurrentDateTime } from '../../commom/commonMethod';
import uploadDocuments from "../../txnUploadData/uploadDocuments"
import CAFRequest from "../../txnUploadData/cafRequest"
import GlobalPOIModel from '../../Model/POIModel'

var GSON = require('gson');

const display = {
    display: 'block'
};
const hide = {
    display: 'none'
};

const POICapture = () => {

    const history = useHistory()
    const [loading, setLoading] = useState(false);
    const [showPhotoView, setShowPhotoView] = useState(false);
    const [{ app: { pincode, custLocalAdd, isOutstation, SelectedDocObject } }, dispatch] = useGlobalState();
    const [APIKey, setAPIKey] = useState('');
    const [DeviceDate, setDeviceDate] = useState('');
    const [reqCode, setReqCode] = useState('');
    const [HyperVerge_Data, setHyperVerge_Data] = useState('');
    const [SDKError, setSDKError] = useState('');
    const [SDKResult, setSDKResult] = useState('');
    const [SDKImage, setSDKImage] = useState('');
    const [SDKHeader, setSDKHeader] = useState('');
    const [SDKURI, setSDKURI] = useState('');
    const [FaceMatchIdfySDKAllowFlag, setFaceMatchIdfySDKAllowFlag] = useState('');
    const [FaceMatch_SDK_NA, setFaceMatch_SDK_NA] = useState('');
    const [selectedDocJourney, setSelectedDocJourney] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {

        var date = new Date().getDate();

        var month = new Date().getMonth() + 1;

        var year = new Date().getFullYear();

        var hours = new Date().getHours(); //Current Hours

        var min = new Date().getMinutes(); //Current Minutes

        var sec = new Date().getSeconds(); //Current Seconds

        var Finaldate = (date + "-" + '0' + month + "-" + year + " " + hours + ":" + min + ":" + sec);

        setDeviceDate(Finaldate)

        //tbd
        // let HV_ACCURACY = getValueFromAuthConfigList('HV_ACCURACY').toString()
        // let LATLONG_INTERVAL = getValueFromAuthConfigList('LATLONG_INTERVAL').toString()

        if (window.Mobile) {
            // window.Mobile.startLocationUpdates(HV_ACCURACY, LATLONG_INTERVAL)
        }


    }, []);


    const fetchLocation = (e, param) => {
        e.preventDefault();
        console.log('param', param)
        setReqCode(param)
        if (window.Mobile) {
            window.Mobile.getLocation()
        }
    }

    const previewClicked = (e,str) => {
        debugger;
        e.preventDefault();
        if (str == "FRONT") {
            var base64Icon = 'data:image/png;base64,' + GlobalPOIModel.poiImage;
            document.getElementById("previewImage").src = base64Icon;
        } else {
            var base64Icon = 'data:image/png;base64,' + GlobalPOIModel.poaImage;
            document.getElementById("previewImage").src = base64Icon;
        }
        setShowDialog(true)
    }



    const onValueSet = (test, param) => {
        //frm.preventDefault();

        if (param == "ERROR") {

            setSDKError(document.getElementById(param).value)
            console.log("Error", document.getElementById(param).value);

        } else if (param == "RESULT") {

            setSDKResult(document.getElementById(param).value)
            console.log("RESULT", document.getElementById(param).value);

        } else if (param == "IMAGE") {

            setSDKImage(document.getElementById(param).value)
            console.log("IMAGE", document.getElementById(param).value);


        } else if (param == "HEADER") {
            setSDKHeader(document.getElementById(param).value)
            console.log("HEADER", document.getElementById(param).value);


        } else if (param == "URI") {
            setSDKURI(document.getElementById(param).value)
            console.log("URI", document.getElementById(param).value);

        }


    }


    const onSubmit = (e) => {

        console.log("SubmitValue", document.getElementById("SUBMIT").value)

        if (document.getElementById("SUBMIT").value == "DOC") {
            if (SDKError != null && SDKError != '') {
                var jsonError = JSON.parse(SDKError)
                console.log("JSON", jsonError)
                var errorCode = jsonError.errorCode;
                console.log("SubmitError", errorCode)
                var errorMessage = getHypervergeErrorMessage(errorCode, jsonError.errMsg);

                confirmAlert({
                    message: errorMessage,
                    buttons: [
                        {
                            label: 'Ok',
                        },
                    ]
                })
            } else {
                console.log("Json", SDKResult)
                var jsonSucess = JSON.parse(SDKResult)
                console.log("jsonSucess", jsonSucess)

                var documentUri = jsonSucess.imageUri;
                console.log("documentUri", documentUri)

                if (reqCode == "Front Side") {
                    //if in case sdk not able to gave proper uri
                    if (documentUri == null || documentUri == '') {
                        console.log("onsubmit", "sunmiot");
                        showErrorAlert("Please capture photo again.");
                        return;
                    } else {

                        if (SDKImage == null) {
                            console.log("onsubmit", "sunmiot1");
                            showErrorAlert("Please capture photo again.");
                            return;
                        }
                    }

                } else if (reqCode == "Back Side") {
                    //if in case sdk not able to gave proper uri
                    if (documentUri == null || documentUri == '') {
                        console.log("onsubmit", "sunmiot2");
                        showErrorAlert("Please capture photo again.");
                        return;
                    } else {
                        if (SDKImage == null) {
                            console.log("onsubmit", "submiot3");
                            showErrorAlert("Please capture photo again.");
                            return;
                        }
                    }

                }
                console.log("image", SDKImage);

                setLoading(true)

                if (selectedDocJourney == "hyperverge") {
                    console.log("startpoi", "startpoi")
                    startPOIDispSet(documentUri);
                } else {
                    startPOIDispSetVishwam(documentUri);
                }

            }
        } else if (document.getElementById("SUBMIT").value == "OCR") {
            setLoading(false)

            console.log("OCR RESULT", "Hanlded");
            console.log('SDKResult', GSON.parse(GSON.encode(SDKResult)))
            console.log('SDKError', SDKError)
            var jsonSuccess = "";
            if (SDKResult != null && SDKResult != '') {
                jsonSuccess = JSON.stringify(SDKResult)
                console.log('jsonSuccess', jsonSuccess, jsonSuccess.statusCode)
            }
            var result = false;
            if (SDKError != null && SDKError != '') {
                //error msg

                var jsonError = JSON.parse(JSON.stringify(SDKError))
                console.log("JSON", jsonError)
                var errorCode = jsonError.errorCode;
                console.log("SubmitError", errorCode)
                var errorMessage = ""
                if (selectedDocJourney == "hyperverge") {
                    errorMessage = getHypervergeErrorMessage(errorCode, jsonError.errMsg);
                } else {
                    errorMessage = jsonError.errorMsg;
                }

                confirmAlert({
                    message: errorMessage,
                    buttons: [
                        {
                            label: 'Ok',
                        },
                    ]
                })

            } else if (jsonSuccess.statusCode == "200") {

                var array_data = jsonSuccess.result;
                var headers = JSON.parse(SDKHeader)
                //
                for (let i = 0; i < array_data.length; i++) {
                    var doc_types = [];
                    if (reqCode == "Front Side") {
                        doc_types = getDocumentType(GlobalPOIModel.doctypecode, true).split(",");
                    } else {
                        doc_types = getDocumentType(GlobalPOIModel.doctypecode, false).split(",");
                    }
                    console.log("DOCTYPES", doc_types.length);
                    if (doc_types != "" && doc_types.length > 0) {

                        for (let j = 0; j < doc_types.length; j++) {
                            console.log("DOCTYPES", doc_types[j] + "," + array_data[i].type);
                            if (doc_types[j] == (array_data[i].type)) {
                                result = true;
                                var obj_data = array_data[i];
                                var requestID = "", referenceId = "";
                                if (JSON.stringify(headers).includes("X-HV-Request-Id")) {
                                    requestID = headers["X-HV-Request-Id"];

                                }
                                if (JSON.stringify(headers).includes("X-HV-Reference-Id")) {
                                    referenceId = headers["X-HV-Reference-Id"];
                                }
                                console.log("objdata", obj_data);
                                obj_data.requestId = requestID
                                obj_data.referenceId = referenceId
                                console.log("objdata", obj_data.requestId);

                                break;
                            }
                        }
                    } else {
                        result = true;
                        var obj_data = array_data[i];
                        var requestID = "", referenceId = "";
                        if (JSON.stringify(headers).includes("X-HV-Request-Id")) {
                            requestID = headers["X-HV-Request-Id"];

                        }
                        if (JSON.stringify(headers).includes("X-HV-Reference-Id")) {
                            referenceId = headers["X-HV-Reference-Id"];
                        }




                        obj_data.requestId = requestID;
                        obj_data.referenceId = referenceId;
                    }

                    console.log("loop", i);
                }
                if (reqCode == "Front Side") {
                    console.log("ocrinside", result);
                    if (result) {
                        //set photo capture timestamp
                        GlobalPOIModel.setCustPOITime(getCurrentDateTime());

                        GlobalPOIModel.setCustPOILat("test");
                        GlobalPOIModel.setmOrnNumber(config.ORN);
                        GlobalPOIModel.setCustPOILong("test");
                        GlobalPOIModel.setSdkUsed("hyperverge");
                        GlobalPOIModel.setHyperverge_POI_1_Img_Path(SDKURI);
                        console.log("change", GlobalPOIModel.Hyperverge_POI_1_Img_Path);

                        //    imageFilePathPOI1 = setDisplayImage(btnImagePOI1);
                        //do image processing
                        var base64Icon = 'data:image/png;base64,' + SDKImage;
                        document.getElementById("FrontImage").src = base64Icon;
                        uploadDocuments.CUST_EKYC = base64Icon;
                        GlobalPOIModel.setpoiImage(SDKImage);
                        GlobalPOIModel.setPOI_Response(JSON.stringify(obj_data));
                    } else {
                        console.log("ocrinside1", result);

                        //document not matched
                        confirmAlert({
                            message: "Capture document Front side photo.",
                            buttons: [
                                {
                                    label: 'Ok',
                                },
                            ]
                        })
                        return;
                    }
                } else if (reqCode == "Back Side") {
                    console.log("ocrinsideback", result);

                    if (result) {
                        //set photo capture timestamp
                        GlobalPOIModel.setCustPOATime(getCurrentDateTime());
                        GlobalPOIModel.setCustPOISecondLat("test");
                        GlobalPOIModel.setCustPOISecondLong("test");
                        GlobalPOIModel.setSdkUsed("hyperverge");


                        GlobalPOIModel.setHyperverge_POI_2_Img_Path(SDKURI);
                        GlobalPOIModel.setPOA_Response(JSON.stringify(obj_data));


                        //imageFilePathPOI2 = setDisplayImage(btnImagePOI2);
                        //do image processing
                        var base64Icon = 'data:image/png;base64,' + SDKImage;
                        document.getElementById("BackImage").src = base64Icon;
                        uploadDocuments.CUST_EKYC_CONSENT = base64Icon;
                        GlobalPOIModel.setpoaImage(SDKImage);

                        // global.setPOIFilePath(imageFilePathPOI2);


                        //   mSelectedPOIModel.setPOA_Response(obj_data.toString());
                    } else {
                        showErrorAlert("Capture document Back side photo.");
                    }
                }


            } else {


                if (selectedDocJourney == "vishwam") {
                    if (jsonSuccess != null && (JSON.stringify(jsonSuccess)).includes("error")) {
                        showErrorAlert(jsonSuccess.error);

                    } else {
                        showErrorAlert("Error in OCR Call");
                    }


                } else {
                    showErrorAlert("Error");
                }
            }
        } else if (document.getElementById("SUBMIT").value = "ALIGN") {
            setLoading(false)
            console.log("ALIGN RESULT", "Hanlded");
            var jsonSuccess = "";
            if (SDKResult != null && SDKResult != '') {
                var jsonSuccess = JSON.parse(SDKResult)
            }
            var result = false;
            if (SDKError != null && SDKError != '') {
                //error msg


                var jsonError = JSON.parse(SDKError)
                console.log("JSON", jsonError)
                var errorCode = jsonError.errorCode;
                console.log("SubmitError", errorCode)
                var errorMessage = getHypervergeErrorMessage(errorCode, jsonError.errMsg);

                confirmAlert({
                    message: errorMessage,
                    buttons: [
                        {
                            label: 'Ok',
                        },
                    ]
                })

            } else if (jsonSuccess.statusCode == "200") {

                //do image processing
                var base64Icon = 'data:image/png;base64,' + SDKImage;
                document.getElementById("FrontImage").src = base64Icon;
                uploadDocuments.CUST_EKYC = base64Icon;
                GlobalPOIModel.setpoiImage(SDKImage);
                GlobalPOIModel.setCustPOITime(getCurrentDateTime);
                GlobalPOIModel.setCustPOILat("");
                GlobalPOIModel.setCustPOILong("");
                GlobalPOIModel.setSdkUsed("hyperverge");
                GlobalPOIModel.setPOI_Response("");

                GlobalPOIModel.setHyperverge_POI_1_Img_Path(SDKURI);




            } else {
                confirmAlert({
                    message: "Error",
                    buttons: [
                        {
                            label: 'Ok',
                        },
                    ]
                })
                return;
            }
        }
    }

    const getDocumentType = (doc_type, front) => {

        if (doc_type == ("Z00005") && front) {
            return "aadhaar_front_bottom";
        } else if (doc_type == "Z00005" && !front) {
            return "aadhaar_back";
        } else if (doc_type == ("FS0002") && front) {
            return "passport_front";
        } else if (doc_type == ("FS0002") && !front) {
            return "passport_back";
        } else if (doc_type == ("Z00008") && front) {
            return "voterid_front,voterid_front_new";
        } else if (doc_type == ("Z00008") && !front) {
            return "voterid_back";
        } else if (doc_type == ("Z00001") && front) {
            return "pan,old_pan";
        }
        return "";
    }

    const getOCRResult = (uri, param) => {
        //Making OCR call
        console.log("ocr", "called")
        var OCR_ENDPOINT = "";
        var jsonBody;
        console.log("isfftx", config.isFTTX)
        if (config.isFTTX) {
            jsonBody = {
                "dataLogging": "yes",
                "signed": "yes",

            }
        } else {
            jsonBody = {
                "dataLogging": "yes",
                "signed": "yes",
                "allowOnlyHorizontal": "yes"

            }
        }
        var jsonHeader
        if (config.isFTTX) {
            jsonHeader = {
                "referenceId": GlobalPOIModel.mOrnNumber,
                "journey": "na"
            }
        } else {
            jsonHeader = {
                "referenceId": GlobalPOIModel.mOrnNumber
            }
        }

        if (window.Mobile) {
            var appId = getValueFromAuthConfigList("HV_AppId")
            var appKey = getValueFromAuthConfigList("HV_AppKey")
            var appMixPanel = getValueFromAuthConfigList("HV_MIX_PANEL")
            var apptimeout = getValueFromAuthConfigList("HV_TIMEOUT")
            console.log("ProcessocrJSonbody", JSON.stringify(jsonBody));
            //cc
            window.Mobile.processOCR("hyperverge", "getocr", "https://jio-docs-staging.hyperverge.co/v2.0/readKYC", uri, JSON.stringify(jsonBody), JSON.stringify(jsonHeader), appId, appKey, appMixPanel, apptimeout);
            //end

        }

    }

    const getOCRResultVishwam = (uri, param) => {
        //Making OCR call
        console.log("ocr", "called")
        var OCR_ENDPOINT = "";
        console.log("isfftx", config.isFTTX)

        var isFrontView = false;
        var jsonBody;
        if (reqCode == "Front Side") {
            jsonBody = {
                "front_view": true,
                "signed": "yes",
                "allowOnlyHorizontal": "yes",
                "datalogging": "yes",
                "app_id": "dkyc",
                "allowDataLogging": true,
                "store_id": "INT9"

            }
        } else {
            jsonBody = {
                "front_view": false,
                "signed": "yes",
                "allowOnlyHorizontal": "yes",
                "datalogging": "yes",
                "app_id": "dkyc",
                "allowDataLogging": true,
                "store_id": "INT9"

            }
        }


        var jsonHeader
        if (config.isFTTX) {
            jsonHeader = {
                "referenceId": config.ORN,
                "journey": "na"
            }
        } else {
            jsonHeader = {
                "referenceId": config.ORN
            }
        }

        if (window.Mobile) {
            var appId = "dkyc"

            var appKey = "oljsGtPZWqQEjPcVKOrDBqNLLulfPDrhlvRHoNVRHkqkpjFPZWAOxlFugtYAAopO"

            var appMixPanel = "0"

            var apptimeout = ""
            console.log("VISHWAM_AppId", appId)
            console.log("VISHWAM_AppKey", appKey)
            console.log("VISHWAM_MIX_PANEL", appMixPanel)
            console.log("VISHWAM_TIMEOUT", apptimeout)
            console.log("jsonBody", JSON.stringify(jsonBody))

            //cc
            window.Mobile.processOCR("vishwam", "getocr", "https://jio-docs-staging.hyperverge.co/v2.0/readKYC", uri, JSON.stringify(jsonBody), JSON.stringify(jsonHeader), appId, appKey, appMixPanel, apptimeout);
            //end

        }
    }

    const showErrorAlert = (message) => {
        confirmAlert({
            message: message,
            buttons: [
                {
                    label: 'Ok',
                },
            ]
        });
    }

    const requestPermissions = () => {

        function onResponse(response) {
            if (response) {
                console.log("Permission was granted");
            } else {
                console.log("Permission was refused");
            }
            return window.browser.permissions.getAll();
        }

        navigator.permissions.query({ name: 'geolocation' })
            .then(onResponse)
            .then((currentPermissions) => {
                console.log(`Current permissions:`, currentPermissions);
            });
    }

    const validateAndNext = (e) => {
        e.preventDefault();
        var GlobalPOIModel = require("../../commom/Modal/POIModel").default
        if (GlobalPOIModel.PhotoCount > 1) {
            if ((GlobalPOIModel.Hyperverge_POI_1_Img_Path == null || GlobalPOIModel.Hyperverge_POI_1_Img_Path == '')) {
                showErrorAlert("Please Capture POI");
            } else if ((GlobalPOIModel.Hyperverge_POI_2_Img_Path == null ||
                GlobalPOIModel.Hyperverge_POI_2_Img_Path == '')) {
                showErrorAlert("Please Capture POA");

            } else {

                callDigKYCPoaFragment();



            }
        } else {
            if ((GlobalPOIModel.Hyperverge_POI_1_Img_Path == null || GlobalPOIModel.Hyperverge_POI_1_Img_Path == '')) {
                showErrorAlert("Please Capture POI");
            } else {

                callDigKYCPoaFragment();



            }
        }

    }

    const callDigKYCPoaFragment = () => {
        // this.requestPermissions()

        //console.log("navigator.permissions.query({name:'geolocation'})   : ", navigator.permissions.query({ name: 'geolocation' }))

        // window.browser.permissions.remove(
        //     navigator.permissions.query({name:'geolocation'})
        //   )

        // console.log("navigator.permissions.query({name:'geolocation'})   : ", navigator.permissions.query({ name: 'geolocation' }).PromiseValue
        // )

        // navigator.permissions.query({ name: 'geolocation' })
        //     .then(function (permissionStatus) {
        //         console.log('geolocation permission state is ', permissionStatus.state);

        //         permissionStatus.onchange = function () {
        //             console.log('geolocation permission state has changed to ', that.props);
        //         };
        //     });



        // var lat = that.props.state.coords && that.props.state.coords.latitude

        // var lon = that.props.state.coords && that.props.state.coords.longitude;
        // console.log("lat : ", lat);
        // console.log("lon : ", lon);

        history.push('/DKYCPOA')

    }



    const verifyAlignment = (uri, param, number) => {
        console.log("1", uri);
        console.log("2", param);
        console.log("3", number);
        setLoading(true)

        var OCR_ENDPOINT = "";
        var jsonBody;
        if (config.isFTTX) {
            jsonBody = {
                "dataLogging": "yes",
                "signed": "yes"

            }
        } else {
            jsonBody = {
                "dataLogging": "yes",
                "signed": "yes",
                "allowOnlyHorizontal": "yes"

            }
        }

        var jsonHeader = {
            "referenceId": GlobalPOIModel.mOrnNumber
        }
        if (window.Mobile) {
            var appId = getValueFromAuthConfigList("HV_AppId")

            var appKey = getValueFromAuthConfigList("HV_AppKey")

            var appMixPanel = getValueFromAuthConfigList("HV_MIX_PANEL")

            var apptimeout = getValueFromAuthConfigList("HV_TIMEOUT")

            console.log("ProcessocrJSonbody", JSON.stringify(jsonBody));

            //cc
            window.Mobile.verifyAlignment("hyperverge", "verifyalignment", "https://jio-docs-staging.hyperverge.co/v2.0/verifyAlignment", uri, JSON.stringify(jsonBody), JSON.stringify(jsonHeader), appId, appKey, appMixPanel, apptimeout);
            //end
        }

    }

    const startPOIDispSetVishwam = (uri) => {
        if (GlobalPOIModel.isAadharKYC) {
            if (reqCode == "Front Side") {
                getOCRResultVishwam(uri, reqCode);
            } else if (reqCode == "Back Side") {
                getOCRResultVishwam(uri, reqCode);
            }

        } else {
            getOCRResultVishwam(uri, reqCode);
        }

    }

    const startPOIDispSet = (uri) => {
        console.log("startPOIDispSet", GlobalPOIModel.IS_OCR);


        if (GlobalPOIModel.isAadharKYC) {
            if (reqCode == "Front Side") {
                getOCRResult(uri, reqCode);
                console.log("startPOIDispSet", "1");

            } else if (reqCode == "Back Side") {
                console.log("startPOIDispSet", "2");
                getOCRResult(uri, reqCode);
            }
        }
        else {
            if (reqCode == "Front Side") {
                if (GlobalPOIModel.IS_OCR != null &&
                    GlobalPOIModel.IS_OCR == ("Y")) {
                    getOCRResult(uri, reqCode);
                } else {
                    verifyAlignment(uri, reqCode, 1);
                }

            } else if (reqCode == "Back Side") {
                if (GlobalPOIModel.IS_OCR != null && GlobalPOIModel.IS_OCR == ("Y")) {
                    getOCRResult(uri, reqCode);
                } else {
                    verifyAlignment(uri, reqCode, 2);
                }
            }
        }
    }

    const setGeoLocation = (e) => {
        e.preventDefault()
        console.log(reqCode)
        console.log(document.getElementById('LAT').value)
        console.log(document.getElementById('LON').value)

        const currentDateTime = new Date()
        let currentMonth = ''
        if (currentDateTime.getMonth().length == 1) {
            currentMonth = '0' + currentDateTime.getMonth()
        }
        else {
            currentMonth = currentDateTime.getMonth()
        }
        if (reqCode == "Back Side") {
            let DG_POA = "POA;" + SelectedDocObject.doctypecode + ";" + GlobalPOIModel.docNumber + ";;;" +
                SelectedDocObject.issuingauth + ";" + document.getElementById('LAT').value + "," + document.getElementById('LON').value + ";" +
                currentDateTime.getFullYear() + "-" + currentMonth + "-" + currentDateTime.getDate() + "T" + currentDateTime.getHours() + ":" + currentDateTime.getMinutes() + ":" + currentDateTime.getSeconds() + ";hyperverge;"
            console.log(DG_POA)
            CAFRequest.DG_POA = DG_POA
        }
        else if (reqCode == "Front Side") {
            let DG_POI = "POI;" + SelectedDocObject.doctypecode + ";" + GlobalPOIModel.docNumber + ";;;" +
                SelectedDocObject.issuingauth + ";" + document.getElementById('LAT').value + "," + document.getElementById('LON').value + ";" +
                currentDateTime.getFullYear() + "-" + currentMonth + "-" + currentDateTime.getDate() + "T" + currentDateTime.getHours() + ":" + currentDateTime.getMinutes() + ":" + currentDateTime.getSeconds() + ";hyperverge;"
            console.log(DG_POI)

            CAFRequest.DG_POI = DG_POI

        }
        callRespectiveCameraClass();

    }

    const callRespectiveCameraClass = () => {
        var config = require('../../config')
        if (GlobalPOIModel.isAadharKYC) {
            if (FaceMatchIdfySDKAllowFlag == ("2")) {
                startDocumentCaptureHyperVerge();
            } else if (FaceMatchIdfySDKAllowFlag == ("6")) {
                startDocumentCaptureVishwam();
            } else {
                //normal camera
            }
        } else {
            // if(!config.isFTTX){
            if (FaceMatch_SDK_NA == ("4")) {
                startDocumentCaptureHyperVerge();
            } else if (FaceMatch_SDK_NA == ("8")) {
                startDocumentCaptureVishwam();
            } else {
                //normal camera
            }
            // }else{
            //     //normla camera
            // }

        }
    }

    const startDocumentCaptureVishwam = () => {
        selectedDocJourney = "vishwam";
        console.log("vishwam doc ", "called")
        var jsonBody;
        console.log("isfftx", config.isFTTX)
        var isFrontview = false;
        if (reqCode == "Front Side") {
            isFrontview = true;
        }

        jsonBody = {
            "shouldShowReviewScreen": true,
            "shouldSetPadding": true,
            "padding": 0.05,
            "document": "CARD",
            "allowDataLogging": true,
            "store_id": "INT9",
            "docCapturePrompt": reqCode,
            "front_view": isFrontview,
            "shouldAllowPhoneTilt": false,
            // "allowedTiltRoll": '',
            // "allowedTiltPitch": ''
        }

        if (!config.isFTTX) {
            //end
            var angle = getValueFromAuthConfigList("HV_TILT_ANGLE");
            var tilt = getValueFromAuthConfigList("HV_TILT");
            var roll = '', pitch = ''
            if (tilt != '') {
                if (tilt.toUpperCase() == "TRUE") {
                    jsonBody.shouldAllowPhoneTilt = true
                }

            }
            if (angle != '') {
                roll = angle.split(",")[0];
                pitch = angle.split(",")[1];
                jsonBody.allowedTiltRoll = parseInt(roll)
                jsonBody.allowedTiltPitch = parseInt(pitch)

            }

        }
        if (window.Mobile) {

            var appId = "dkyc"
            var appKey = "oljsGtPZWqQEjPcVKOrDBqNLLulfPDrhlvRHoNVRHkqkpjFPZWAOxlFugtYAAopO"
            var appMixPanel = "0"
            var apptimeout = ""
            console.log("VISHWAM_AppId", appId)
            console.log("VISHWAM_AppKey", appKey)
            console.log("VISHWAM_MIX_PANEL", appMixPanel)
            console.log("VISHWAM_TIMEOUT", apptimeout)
            console.log("jsonBody", JSON.stringify(jsonBody))

            //cc
            window.Mobile.processDocCapture("vishwam", "doccapture", JSON.stringify(jsonBody), appId, appKey, appMixPanel, apptimeout);
            //end
        }

    }

    const startDocumentCaptureHyperVerge = () => {
        selectedDocJourney = "hyperverge";
        var aspectRatio = ""//from backend

        var docConfig = {
            "shouldShowReviewScreen": true,
            "document": {
                "aspectRatio": ""
            },

            "docCaptureSubText": "",
            "shouldSetPadding": true,
            "padding": "",
            "document": "",
            "shouldAllowPhoneTilt": '',
            "allowedTiltRoll": '',
            "allowedTiltPitch": ''
        }

        if (SelectedDocObject.doctypecode === "Z00005" || SelectedDocObject.doctypecode === "Z00001") {
            HyperVerge_Data = "CARD";

        } else

            if (SelectedDocObject.doctypecode === "FS0002") {
                HyperVerge_Data = "PASSPORT";


            } else

                if (SelectedDocObject.doctypecode === "Z00008") {
                    HyperVerge_Data = "OTHER";


                } else {
                    HyperVerge_Data = "A4";
                }



        if (HyperVerge_Data === "CARD" || HyperVerge_Data === "PASSPORT" || HyperVerge_Data === "OTHER") {

            aspectRatio = SelectedDocObject.Aspect_ratio

        }
        else {
            aspectRatio = "1.5"
        }

        docConfig.document = HyperVerge_Data;
        docConfig.padding = parseFloat(0.05);
        docConfig.docCaptureSubText = reqCode;

        if (!config.isFTTX) {
            var angle = getValueFromAuthConfigList("HV_TILT_ANGLE");
            var tilt = getValueFromAuthConfigList("HV_TILT");
            if (tilt != '') {
                docConfig.shouldAllowPhoneTilt = (tilt);
            }
            if (angle != '') {
                var roll = angle.split(",")[0];
                var pitch = angle.split(",")[1];
                docConfig.allowedTiltRoll = (roll)
                docConfig.allowedTiltPitch = (pitch);
            }

        }


        console.log(JSON.stringify(docConfig))
        if (window.Mobile) {

            var appId = getValueFromAuthConfigList("HV_AppId")

            var appKey = getValueFromAuthConfigList("HV_AppKey")

            var appMixPanel = getValueFromAuthConfigList("HV_MIX_PANEL")

            var apptimeout = getValueFromAuthConfigList("HV_TIMEOUT")
            console.log("HV_AppId", appId)
            console.log("HV_AppKey", appKey)
            console.log("HV_MIX_PANEL", appMixPanel)
            console.log("HV_TIMEOUT", apptimeout)
            console.log("docConfig", JSON.stringify(docConfig))


            //cc
            window.Mobile.processDocCapture("hyperverge", "doccapture", JSON.stringify(docConfig), appId, appKey, appMixPanel, apptimeout);
            //end


        }

    }

    return (
        <div>
            <div className="modal" role="dialog" style={showDialog ? display : hide}>
                <div className="modal-dialog" style={{ marginTop: "100px", padding: "21px" }}>
                    <div className="modal-content" style={{ "height": "350px" }} justifyContent='center' >
                        <div className="modal-header1">
                            <h5 className="modal-title" style={{ 'font-weight': 'bold', color: "#ffffff" }}>Preview</h5>
                            <a className="close" style={{ color: "#ffffff" }} onClick={() => setShowDialog(false)}>X</a>
                        </div>
                        <img id="previewImage" style={{ "height": "330px" }} justifyContent='center' ></img>
                    </div>
                </div>
            </div>

            <div  style={{ height: "100vh" }}>
                <form id="SdkReponseForm">
                    <div className="spin">
                        <Spinner visible={loading}
                            spinnerColor={"rgba(0, 0, 0, 0.3)"} />
                    </div>
                    <div>
                        <div class="my_app_container">
                            {FixedHeader()}
                            <div style={{ textAlign: "center", overflowY: "scroll", height: "480px" }}>
                                <p style={{ color: "black", "fontWeight": "bolder" }}>Capture Front View</p>
                                <div id="FrontView" class="photoPreviewFrame">
                                    <button style={{ "padding": "20px" }} onClick={(e) => fetchLocation(e, "Front Side")}>
                                        <img id="FrontImage" height="100" width="100" src={require("../../img/poi.png")} alt="Capture Front View"></img>
                                    </button>
                                    <div class="col-6 col-sm-6">
                                        <button type="submit" onClick={(e) => previewClicked(e, "FRONT")} class="btn-block jio-btn jio-btn-primary" >Preview</button>
                                    </div>
                                </div>


                                {showPhotoView ?
                                    <p class="mt-40" style={{
                                        color: "black", "fontWeight": "bolder",

                                    }}>Capture Back View</p>
                                    : null}

                                {showPhotoView ?
                                    <div id="BackView"
                                        class="photoPreviewFrame"
                                    >
                                        <button style={{ "padding": "20px" }} onClick={(e) => fetchLocation(e, "Back Side")}>
                                            <img id="BackImage" height="100" width="100" src={require("../../img/poi.png")} alt="Capture Back View"></img>
                                        </button>
                                        <div class="col-6 col-sm-6">
                                            <button type="submit" class="btn-block jio-btn jio-btn-primary" onClick={(e) => previewClicked(e, "BACK")} >Preview</button>
                                        </div>
                                    </div>
                                    : null}

                                {/* <p class="mt-10" style={{ color: "red", "fontWeight": "bolder" }}>Ensure camera to complete auto focus for image capture</p> */}
                            </div>
                        </div>




                        <div>
                            <input class="mt-40" id="ERROR" type="text" style={{ "display": "none" }} onClick={(e) => onValueSet(e, document.getElementById("SdkReponseForm"),
                                "ERROR")} />

                        </div>
                        <div>
                            <input class="mt-40" id="RESULT" type="text" style={{ "display": "none" }} onClick={(e) => onValueSet(e, document.getElementById("SdkReponseForm"),
                                "RESULT")} />

                        </div>
                        <div>
                            <input class="mt-40" id="IMAGE" type="text" style={{ "display": "none" }} onClick={(e) => onValueSet(e, document.getElementById("SdkReponseForm")
                                ,
                                "IMAGE")} />

                        </div>
                        <div>
                            <input class="mt-40" id="HEADER" type="text" style={{ "display": "none" }} onClick={(e) => onValueSet(e, document.getElementById("SdkReponseForm")
                                ,
                                "HEADER")} />

                        </div>
                        <div>
                            <input class="mt-40" id="URI" type="text" style={{ "display": "none" }} onClick={(e) => onValueSet(e, document.getElementById("SdkReponseForm")

                                ,
                                "URI")} />

                        </div>

                        <div>
                            <input class="mt-40" id="SUBMIT" type="text" style={{ "display": "none" }} onClick={(e) => onSubmit(e, document.getElementById("SdkReponseForm"))} />

                        </div>
                        <div>
                            <input class="mt-40" id="LAT" type="text" style={{ "display": "none" }} />

                        </div>
                        <div>
                            <input class="mt-40" id="LON" type="text" style={{ "display": "none" }} />

                        </div>
                        <div>
                            <input class="mt-40" id="SUBMITLOC" onClick={(e) => setGeoLocation(e)} type="text" style={{ "display": "none" }} />

                        </div>
                    </div>

                </form>



            </div>
            <div class="bottom-fixed-btn">
                <p class="mt-10" style={{ color: "red", "fontWeight": "bolder" }}>Ensure camera to complete auto focus for image capture</p>
                <div class="row m-0 mt-4">
                    <div class="col-12 p-2">
                        <button type="button" onClick={validateAndNext.bind(this)} class="btn-block jio-btn jio-btn-primary">NEXT</button>
                    </div>
                </div>
            </div>
        </div>
    )





}


export default POICapture