const express = require("express");
const app = express();
const moment = require("moment");
const db = require("./dbconnection.js"); //reference of dbconnection.js

app.use(express.json());
app.post("/hl7_message", (req, res) => {
	jsonObj = req.body;
	var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD");

	var message_type = jsonObj.MESSAGE_HEADER.MESSAGE_TYPE;
	var SENDING_APPLICATION = jsonObj.MESSAGE_HEADER.SENDING_APPLICATION;
	var MESSAGE_DATETIME = jsonObj.MESSAGE_HEADER.MESSAGE_DATETIME;

	if (message_type == "ADT^A04") {
		console.log("ADT^A04 Patient registration received ....");
		var GODS_NUMBER = jsonObj.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
		var patientID = jsonObj.PATIENT_IDENTIFICATION.INTERNAL_PATIENT_ID;
		var CCC_NUMBER;
		for (let i = 0; i < patientID.length; i++) {
			if (patientID[i].IDENTIFIER_TYPE == "CCC_NUMBER") {
				CCC_NUMBER = patientID[i].ID;
			}
		}
		var FIRST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.FIRST_NAME;
		var MIDDLE_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.MIDDLE_NAME;
		var LAST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.LAST_NAME;
		var DATE_OF_BIRTH = jsonObj.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
		var SEX = jsonObj.PATIENT_IDENTIFICATION.SEX;
		var PHONE_NUMBER = jsonObj.PATIENT_IDENTIFICATION.PHONE_NUMBER;
		var MARITAL_STATUS = jsonObj.PATIENT_IDENTIFICATION.MARITAL_STATUS;
		var PATIENT_SOURCE = jsonObj.PATIENT_VISIT.PATIENT_SOURCE;
		var ENROLLMENT_DATE = jsonObj.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
		var PATIENT_TYPE = jsonObj.PATIENT_VISIT.PATIENT_TYPE;
		var SENDING_FACILITY = jsonObj.MESSAGE_HEADER.SENDING_FACILITY;
		var GROUP_ID;

		var DoB = DATE_OF_BIRTH;

		var year = DoB.substring(0, 4);
		var month = DoB.substring(4, 6);
		var day = DoB.substring(6, 8);

		var today = DATE_TODAY;

		var new_date = year + "-" + month + "-" + day;
		var date_diff = moment(today).diff(
			moment(new_date).format("YYYY-MM-DD"),
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
		if (SEX == "F") {
			SEX = "1";
		} else {
			SEX = "2";
		}
		if (MARITAL_STATUS === "") {
			// do stuff
			MARITAL_STATUS = "1";
		}
		if (MARITAL_STATUS == "D") {
			MARITAL_STATUS = "3";
		} else if (MARITAL_STATUS == "M") {
			MARITAL_STATUS = "2";
		} else if (MARITAL_STATUS == "S") {
			MARITAL_STATUS = "1";
		} else if (MARITAL_STATUS == "W") {
			MARITAL_STATUS = "4";
		} else if (MARITAL_STATUS == "C") {
			MARITAL_STATUS = "5";
		}

		var enroll_year = ENROLLMENT_DATE.substring(0, 4);
		var enroll_month = ENROLLMENT_DATE.substring(4, 6);
		var enroll_day = ENROLLMENT_DATE.substring(6, 8);
		var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;

		if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
			res.send(`Invalid CCC Number: ${CCC_NUMBER}`);
		}

		db.getConnection(function(err, connection) {
			if (err) {
				console.log(err);
				process.exit(1);
			} else {
				let find_partnerID =
					"SELECT partner_id FROM tbl_partner_facility WHERE mfl_code =" +
					SENDING_FACILITY;
				connection.query(find_partnerID, function(error, results, fields) {
					// Handle error after the release.
					if (error) {
						//throw error;
						response = "Transaction Error => " + error.sqlMessage;
					} else {
						response = results;
					}
					let partner_id = results[0].partner_id;

					// Don't use the connection here, it has been returned to the pool.

					var gateway_sql =
						"Insert into tbl_client (f_name,m_name,l_name,dob,clinic_number,mfl_code,partner_id,gender,marital,phone_no,GODS_NUMBER,group_id,clinic_id,SENDING_APPLICATION, entry_point, PATIENT_SOURCE, enrollment_date, client_type) VALUES ('" +
						FIRST_NAME +
						"', '" +
						MIDDLE_NAME +
						"','" +
						LAST_NAME +
						"','" +
						new_date +
						"','" +
						CCC_NUMBER +
						"','" +
						SENDING_FACILITY +
						"','" +
						partner_id +
						"','" +
						SEX +
						"','" +
						MARITAL_STATUS +
						"','" +
						PHONE_NUMBER +
						"','" +
						GODS_NUMBER +
						"','" +
						parseInt(GROUP_ID) +
						"','" +
						1 +
						"','" +
						SENDING_APPLICATION +
						"','IL','" +
						PATIENT_SOURCE +
						"','" +
						new_enroll_date +
						"','" +
						PATIENT_TYPE +
						"')";

					var response;
					// Use the connection
					connection.query(gateway_sql, function(error, results, fields) {
						// And done with the connection.
						connection.release();

						// Handle error after the release.
						if (error) {
							//throw error;
							response = "Transaction Error => " + error.sqlMessage;
						} else {
							response = "Success,Patient Registration  !!!";
						}
						res.send(response);

						// Don't use the connection here, it has been returned to the pool.
					});
				});
			}
		});
	} else if (message_type == "ADT^A08") {
		console.log("ADT^A08 => Patient Update....");
		var GODS_NUMBER = jsonObj.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
		var patientID = jsonObj.PATIENT_IDENTIFICATION.INTERNAL_PATIENT_ID;
		var CCC_NUMBER;
		for (let i = 0; i < patientID.length; i++) {
			if (patientID[i].IDENTIFIER_TYPE == "CCC_NUMBER") {
				CCC_NUMBER = patientID[i].ID;
			}
		}
		var FIRST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.FIRST_NAME;
		var MIDDLE_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.MIDDLE_NAME;
		var LAST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.LAST_NAME;
		var DATE_OF_BIRTH = jsonObj.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
		var SEX = jsonObj.PATIENT_IDENTIFICATION.SEX;
		var PHONE_NUMBER = jsonObj.PATIENT_IDENTIFICATION.PHONE_NUMBER;
		var MARITAL_STATUS = jsonObj.PATIENT_IDENTIFICATION.MARITAL_STATUS;
		var PATIENT_SOURCE = jsonObj.PATIENT_VISIT.PATIENT_SOURCE;
		var ENROLLMENT_DATE = jsonObj.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
		var PATIENT_TYPE = jsonObj.PATIENT_VISIT.PATIENT_TYPE;
		var SENDING_FACILITY = jsonObj.MESSAGE_HEADER.SENDING_FACILITY;
		var DEATH_DATE = jsonObj.PATIENT_IDENTIFICATION.DEATH_DATE;
		if (DEATH_DATE) {
			var STATUS = "Deceased";
		}
		var GROUP_ID;

		var DoB = DATE_OF_BIRTH;

		var year = DoB.substring(0, 4);
		var month = DoB.substring(4, 6);
		var day = DoB.substring(6, 8);

		var today = DATE_TODAY;

		var new_date = year + "-" + month + "-" + day;
		var date_diff = moment(today).diff(
			moment(new_date).format("YYYY-MM-DD"),
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
		if (SEX == "F") {
			SEX = "1";
		} else {
			SEX = "2";
		}
		if (MARITAL_STATUS === "") {
			// do stuff
			MARITAL_STATUS = "1";
		}
		if (MARITAL_STATUS == "D") {
			MARITAL_STATUS = "3";
		} else if (MARITAL_STATUS == "M") {
			MARITAL_STATUS = "2";
		} else if (MARITAL_STATUS == "S") {
			MARITAL_STATUS = "1";
		} else if (MARITAL_STATUS == "W") {
			MARITAL_STATUS = "4";
		} else if (MARITAL_STATUS == "C") {
			MARITAL_STATUS = "5";
		}

		var enroll_year = ENROLLMENT_DATE.substring(0, 4);
		var enroll_month = ENROLLMENT_DATE.substring(4, 6);
		var enroll_day = ENROLLMENT_DATE.substring(6, 8);
		var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;

		if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
			res.send(`Invalid CCC Number: ${CCC_NUMBER}`);
		}
		db.getConnection(function(err, connection) {
			if (err) {
				console.log(err);
			} else {
				var update_sql =
					"UPDATE tbl_client SET f_name='" +
					FIRST_NAME +
					"',m_name='" +
					MIDDLE_NAME +
					"',l_name='" +
					LAST_NAME +
					"',dob='" +
					DATE_OF_BIRTH +
					"',mfl_code='" +
					SENDING_FACILITY +
					"',gender='" +
					SEX +
					"',marital='" +
					MARITAL_STATUS +
					"',phone_no='" +
					PHONE_NUMBER +
					"',DEATH_DATE='" +
					DEATH_DATE +
					"',status='" +
					STATUS +
					"',group_id='" +
					GROUP_ID +
					"' WHERE clinic_number='" +
					CCC_NUMBER +
					"'";

				var response;
				// Use the connection
				connection.query(update_sql, function(error, results, fields) {
					// And done with the connection.
					connection.release();

					// Handle error after the release.
					if (error) {
						//throw error;
						response = "Transaction Error => " + error.sqlMessage;
					} else {
						response = "Success,Patient Update  !!!";
					}
					res.send(response);

					// Don't use the connection here, it has been returned to the pool.
				});
			}
		});
	} else if (message_type == "SIU^S12") {
		console.log("SIU^S128 => Appointment Scheduling....");

		var GODS_NUMBER = jsonObj.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
		var SENDING_FACILITY = jsonObj.MESSAGE_HEADER.SENDING_FACILITY;
		var patientID = jsonObj.PATIENT_IDENTIFICATION.INTERNAL_PATIENT_ID;

		var CCC_NUMBER;
		for (let i = 0; i < patientID.length; i++) {
			if (patientID[i].IDENTIFIER_TYPE == "CCC_NUMBER") {
				CCC_NUMBER = patientID[i].ID;
			}
		}
		var APPOINTMENT_REASON =
			jsonObj.APPOINTMENT_INFORMATION[0].APPOINTMENT_REASON;
		var APPOINTMENT_TYPE = jsonObj.APPOINTMENT_INFORMATION[0].APPOINTMENT_TYPE;
		var APPOINTMENT_DATE = jsonObj.APPOINTMENT_INFORMATION[0].APPOINTMENT_DATE;
		var APPOINTMENT_PLACING_ENTITY =
			jsonObj.APPOINTMENT_INFORMATION[0].APPOINTMENT_PLACING_ENTITY;
		var ACTION_CODE = jsonObj.APPOINTMENT_INFORMATION[0].ACTION_CODE;
		var APPOINTMENT_NOTE = jsonObj.APPOINTMENT_INFORMATION[0].APPOINTMENT_NOTE;

		var year = APPOINTMENT_DATE.substring(0, 4);
		var month = APPOINTMENT_DATE.substring(4, 6);
		var day = APPOINTMENT_DATE.substring(6, 8);

		var app_date = year + "-" + month + "-" + day;

		var today = moment(new Date()).format("YYYY-MM-DD");

		if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
			res.send("Invalid CCC NUMBER");
		}

		if (!APPOINTMENT_TYPE) {
			APPOINTMENT_TYPE = 2;
		}
		db.getConnection(function(err, connection) {
			if (err) {
				console.log("Error Encountered => " + err);
				process.exit(1);
			} else {
				var response;
				var get_client_sql =
					"SELECT id FROM tbl_client WHERE clinic_number = " +
					CCC_NUMBER +
					" AND mfl_code = " +
					SENDING_FACILITY;
				// Use the connection
				connection.query(get_client_sql, function(error, results, fields) {
					// And done with the connection.
					// Handle error after the release.
					if (error) {
						//throw error;
						response = "Transaction Error => " + error.sqlMessage;
					} else {
						if (results.length === 0) {
							response = `CCC NUMBER": ${CCC_NUMBER} not registered in the system`;
						} else {
							for (var result in results) {
								var client_id = results[result].id;
								console.log("Client ID => " + client_id);
								var APP_STATUS = "Booked";
								var ACTIVE_APP = "1";
								if (ACTION_CODE == "A") {
									//Add new Appointment
									var appointment_sql =
										"Insert into tbl_appointment (client_id,appntmnt_date,app_type_1,expln_app,app_status,entry_point,active_app,reason) VALUES ('" +
										client_id +
										"', '" +
										app_date +
										"','" +
										APPOINTMENT_TYPE +
										"','" +
										APPOINTMENT_REASON +
										"','" +
										APP_STATUS +
										"','" +
										SENDING_APPLICATION +
										"','" +
										ACTIVE_APP +
										"','" +
										APPOINTMENT_NOTE +
										"')";
								}
								// Use the connection
								connection.query(appointment_sql, function(
									error,
									results,
									fields
								) {
									// And done with the connection.
									connection.release();
									// Handle error after the release.
									if (error) {
										//throw error;
										response = "Transaction Error => " + error.sqlMessage;
										console.log(error);
									} else {
										console.log(results);
										response = "Success,Appointment Booking !!!";
									}
									// Don't use the connection here, it has been returned to the pool.
								});
							}
						}
					}
					res.send(response);

					// Don't use the connection here, it has been returned to the pool.
				});
			}
		});
	}
});

app.listen(1440, () => {
	console.log("Ushauri IL listening on port 1440");
});
