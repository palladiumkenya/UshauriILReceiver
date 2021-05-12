const moment = require("moment");
const express = require("express");
const router = express.Router();
const _ = require("lodash");

//Importing models
const Op = require('sequelize').Op;
const {
    Client
} = require("../models/client");
const {
    Partner
} = require("../models/partner");
const {
    Appointment
} = require("../models/appointment");

var today = moment(new Date()).format("YYYY-MM-DD");

router.post("/new-client", async (req, res) => {
    var CCC_NUMBER = req.body.ccc_number;
    var PATIENT_CLINIC_NUMBER = req.body.file_number;
    let FIRST_NAME = req.body.f_name;
    var MIDDLE_NAME = req.body.m_name;
    var LAST_NAME = req.body.l_name;
    var DATE_OF_BIRTH = req.body.dob;
    var SEX = req.body.sex;
    let PHONE_NUMBER = req.body.phone_no;
    let MARITAL_STATUS = req.body.martial_status;
    const PATIENT_SOURCE = "AMPATH TEST";
    let SENDING_APPLICATION = "AMPATH TEST";
    var ENROLLMENT_DATE = req.body.enrollment_date;
    var PATIENT_TYPE = req.body.patient_type;
    var SENDING_FACILITY = req.body.mfl_code;
    let GROUP_ID;
    var COUNTY = req.body.locator_county;
    var SUB_COUNTY = req.body.locator_sub_county
    var WARD = req.body.locator_ward
    var VILLAGE = req.body.locator_village
    var ART_DATE = req.body.art_date;
    let CLIENT_STATUS = req.body.client_status

    //get sex
    if (SEX === "F")
        SEX = "1";
    else
        SEX = "2";
    //get martial
    if (MARITAL_STATUS === "") {
        MARITAL_STATUS = "1";
    }
    if (MARITAL_STATUS === "D") {
        MARITAL_STATUS = "3";
    } else if (MARITAL_STATUS === "M") {
        MARITAL_STATUS = "2";
    } else if (MARITAL_STATUS === "S") {
        MARITAL_STATUS = "1";
    } else if (MARITAL_STATUS === "W") {
        MARITAL_STATUS = "4";
    } else if (MARITAL_STATUS === "C") {
        MARITAL_STATUS = "5";
    }

    //Get group ID
    var date_diff = moment(today).diff(
        moment(DATE_OF_BIRTH).format("YYYY-MM-DD"),
        "days"
    );

    if (date_diff >= 5475 && date_diff <= 6935) {
        GROUP_ID = "2";
    }
    if (date_diff >= 7300) {
        GROUP_ID = "1";
    }
    if (date_diff <= 5110) {
        GROUP_ID = "6";
    }

    var l = {
        f_name: FIRST_NAME,
        l_name: LAST_NAME,
        clinic_number: CCC_NUMBER,
        file_no: PATIENT_CLINIC_NUMBER,
    }
//get valid ccc_number
    if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
        return res
            .status(400)
            .json({
                success: false,
                msg: `Error`,
                response: {
                    msg: `Invalid CCC Number: ${CCC_NUMBER}, The CCC must be 10 digits`,
                    data: l
                }
            });
    }
//get partner
    let partner = await Partner.findOne({
        where: {
            mfl_code: SENDING_FACILITY
        }
    });

    if (_.isEmpty(partner))
        return res
            .status(404)
            .json({
                status: false,
                msg: `Error`,
                response: {
                    message: `MFL CODE: ${SENDING_FACILITY} does not exist in system.`,
                    data: l
                }
            });

    client = {
        group_id: parseInt(GROUP_ID),
        clinic_number: CCC_NUMBER,
        f_name: FIRST_NAME,
        m_name: MIDDLE_NAME,
        l_name: LAST_NAME,
        dob: DATE_OF_BIRTH,
        phone_no: PHONE_NUMBER,
        partner_id: partner.partner_id,
        mfl_code: parseInt(SENDING_FACILITY),
        gender: parseInt(SEX),
        marital: MARITAL_STATUS,
        enrollment_date: ENROLLMENT_DATE,
        art_date: ART_DATE,
        client_type: PATIENT_TYPE,
        patient_source: PATIENT_SOURCE,
        file_no: PATIENT_CLINIC_NUMBER,
        locator_county: COUNTY.locator_county,
        locator_sub_county: SUB_COUNTY.locator_sub_county,
        locator_ward: WARD.locator_ward,
        locator_village: VILLAGE.locator_village,
        sending_application: SENDING_APPLICATION,
        client_status: CLIENT_STATUS
    }

    await Client.create(client)
        .then(function (model) {
            message = "OK";
            response = "Client successfully added.";

            return res.json({
                message: message,
                response: {
                    msg: response,
                    data: model
                }
            });
        })
        .catch(function (err) {
            code = 500;
            response = err.message;
            console.error(err);

            return res.status(400).json({
                response: {
                    msg: response,
                    errors: err.errors,
                }
            });
        });


});

router.post("/update-client", async (req, res) => {
    let SENDING_FACILITY = req.body.mfl_code;
    let new_art_date = req.body.art_date;
    let PATIENT_TYPE = req.body.patient_type;
    let PATIENT_CLINIC_NUMBER = req.body.file_number;
    let SENDING_APPLICATION = "AMPATH TEST";
    let CCC_NUMBER = req.body.ccc_number;

    let isClient = await Client.findOne({
        where: {
            clinic_number: CCC_NUMBER
        }
    });
    if (!_.isEmpty(isClient)){
        let client = {
            mfl_code: parseInt(SENDING_FACILITY),
            art_date: new_art_date,
            client_type: PATIENT_TYPE,
            file_no: PATIENT_CLINIC_NUMBER,
            sending_application: SENDING_APPLICATION
        }
        await Client.update(client, {returning: true, where: {clinic_number: CCC_NUMBER}})
            .then(function (model) {
                message = "OK";
                response = "Client successfully updated.";

                return res.json({
                    message: message,
                    response: {
                        msg: response,
                        data: _.pick(client, [
                            "art_date",
                            "client_type",
                            "file_no",
                            "sending_application",
                            "mfl_code",
                            "updatedAt"
                        ])
                    }
                });
            })
            .catch(function (err) {
                code = 500;
                response = err.message;
                console.error(err);

                return res.json({
                    response: {
                        msg: response,
                        errors: err.errors
                    }
                });
            });

    } else {

        return res.status(400).json({
            response: {
                msg: "Error",
                errors: "CCC Number Does Not exist"
            }
        });
    }

});

router.post("/new-appointment", async (req, res) => {

});

module.exports = router;