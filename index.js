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
		var CCC_NUMBER;
		console.log("REGISTRATION GODS NUMBER =>" + GODS_NUMBER);
		var FIRST_NAME;
		var MIDDLE_NAME;
		var LAST_NAME;
		var DATE_OF_BIRTH = jsonObj.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
		var SEX;
		var PHONE_NUMBER;
		var MARITAL_STATUS;
		var PATIENT_SOURCE = jsonObj.PATIENT_VISIT.PATIENT_SOURCE;
		var ENROLLMENT_DATE = jsonObj.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
		var PATIENT_TYPE = jsonObj.PATIENT_VISIT.PATIENT_TYPE;
		var SENDING_FACILITY;
		var GROUP_ID;

		var result = get_json(jsonObj);

		for (var i = 0; i < result.length; i++) {
			var key = result[i].key;
			var value = result[i].value;

			if (key == "FIRST_NAME") {
				FIRST_NAME = result[i].value;

				console.log("FIRST_NAME  => " + FIRST_NAME + "<br> ");
			} else if (key == "MIDDLE_NAME") {
				MIDDLE_NAME = result[i].value;
				console.log("MIDDLE_NAME  => " + MIDDLE_NAME + "<br> ");
			} else if (key == "LAST_NAME") {
				LAST_NAME = result[i].value;
				console.log("LAST_NAME => " + LAST_NAME + "<br> ");
			} else if (key == "DATE_OF_BIRTH") {
				console.log("Date of Birth " + DATE_OF_BIRTH);
				var DoB = DATE_OF_BIRTH;

				var year = DoB.substring(0, 4);
				var month = DoB.substring(4, 6);
				var day = DoB.substring(6, 8);

				var today = DATE_TODAY;

				var new_date = year + "-" + month + "-" + day;
				console.log("new date ni: " + new_date);
				var date_diff = moment(today).diff(
					moment(new_date).format("YYYY-MM-DD"),
					"days"
				);

				console.log("Date Difference => " + date_diff); // at time of posting, 106 days

				console.log("Birth Date  => " + new_date + " Today " + today);

				if (date_diff >= 5475 && date_diff <= 6935) {
					GROUP_ID = "2";
				}
				if (date_diff >= 7300) {
					GROUP_ID = "1";
				}
				if (date_diff <= 5110) {
					GROUP_ID = "6";
				}

				console.log("Hi group yake ni: " + GROUP_ID);
				console.log("Hi dob yake ni: " + new_date);
			} else if (key == "SEX") {
				if (result[i].value == "F") {
					SEX = "1";
				} else {
					SEX = "2";
				}

				console.log("SEX => " + SEX + "<br> ");
			} else if (key == "PHONE_NUMBER") {
				PHONE_NUMBER = result[i].value;
				console.log("PHONE_NUMBER => " + PHONE_NUMBER + "<br> ");
			} else if (key == "MARITAL_STATUS") {
				if (result[i].value === "") {
					// do stuff
					MARITAL_STATUS = "1";
				}
				if (result[i].value == "D") {
					MARITAL_STATUS = "3";
				} else if (result[i].value == "M") {
					MARITAL_STATUS = "2";
				} else if (result[i].value == "S") {
					MARITAL_STATUS = "1";
				} else if (result[i].value == "W") {
					MARITAL_STATUS = "4";
				} else if (result[i].value == "C") {
					MARITAL_STATUS = "5";
				}

				console.log("MARITAL_STATUS => " + MARITAL_STATUS + "<br> ");
			}
			if (key == "SENDING_FACILITY") {
				SENDING_FACILITY = result[i].value;
				console.log("CCC_NUMBER => " + CCC_NUMBER + " ");
			}
			if (key == "ID") {
				if (result[i + 1].value == "CCC_NUMBER") {
					CCC_NUMBER = result[i].value;
				}
			}
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
				console.log(
					FIRST_NAME +
						MIDDLE_NAME +
						LAST_NAME +
						DATE_OF_BIRTH +
						CCC_NUMBER +
						SENDING_FACILITY +
						GROUP_ID
				);
				var gateway_sql =
					"Insert into tbl_client (f_name,m_name,l_name,dob,clinic_number,mfl_code,gender,marital,phone_no,GODS_NUMBER,group_id, SENDING_APPLICATION, entry_point, PATIENT_SOURCE, enrollment_date, client_type) VALUES ('" +
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
			}
		});
	} else if (message_type == "ADT^A08") {
		console.log("ADT^A08 => Patient Update....");
		var GODS_NUMBER = jsonObj.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
		var CCC_NUMBER;
		console.log("REGISTRATION GODS NUMBER =>" + GODS_NUMBER);
		var FIRST_NAME;
		var MIDDLE_NAME;
		var LAST_NAME;
		var DATE_OF_BIRTH = jsonObj.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
		var SEX;
		var PHONE_NUMBER;
		var MARITAL_STATUS;
		var PATIENT_SOURCE = jsonObj.PATIENT_VISIT.PATIENT_SOURCE;
		var ENROLLMENT_DATE = jsonObj.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
		var PATIENT_TYPE = jsonObj.PATIENT_VISIT.PATIENT_TYPE;
		var SENDING_FACILITY;
		var GROUP_ID;

		var result = get_json(jsonObj);

		for (var i = 0; i < result.length; i++) {
			var key = result[i].key;
			var value = result[i].value;

			if (key == "FIRST_NAME") {
				FIRST_NAME = result[20].value;

				console.log("FIRST_NAME  => " + FIRST_NAME + "<br> ");
			} else if (key == "MIDDLE_NAME") {
				MIDDLE_NAME = result[21].value;
				console.log("MIDDLE_NAME  => " + MIDDLE_NAME + "<br> ");
			} else if (key == "LAST_NAME") {
				LAST_NAME = result[22].value;
				console.log("LAST_NAME => " + LAST_NAME + "<br> ");
			} else if (key == "DATE_OF_BIRTH") {
				console.log("Date of Birth " + DATE_OF_BIRTH);
				var DoB = DATE_OF_BIRTH;

				var year = DoB.substring(0, 4);
				var month = DoB.substring(4, 6);
				var day = DoB.substring(6, 8);

				var today = DATE_TODAY;

				var new_date = year + "-" + month + "-" + day;
				console.log("new date ni: " + new_date);
				var date_diff = moment(today).diff(
					moment(new_date).format("YYYY-MM-DD"),
					"days"
				);

				console.log("Date Difference => " + date_diff); // at time of posting, 106 days

				console.log("Birth Date  => " + new_date + " Today " + today);

				if (date_diff >= 5475 && date_diff <= 6935) {
					GROUP_ID = "2";
				}
				if (date_diff >= 7300) {
					GROUP_ID = "1";
				}
				if (date_diff <= 5110) {
					GROUP_ID = "6";
				}

				console.log("Hi group yake ni: " + GROUP_ID);
				console.log("Hi dob yake ni: " + new_date);
			} else if (key == "SEX") {
				if (result[i].value == "F") {
					SEX = "1";
				} else {
					SEX = "2";
				}

				console.log("SEX => " + SEX + "<br> ");
			} else if (key == "PHONE_NUMBER") {
				PHONE_NUMBER = result[i].value;
				console.log("PHONE_NUMBER => " + PHONE_NUMBER + "<br> ");
			} else if (key == "MARITAL_STATUS") {
				if (result[i].value === "") {
					// do stuff
					MARITAL_STATUS = "1";
				}
				if (result[i].value == "D") {
					MARITAL_STATUS = "3";
				} else if (result[i].value == "M") {
					MARITAL_STATUS = "2";
				} else if (result[i].value == "S") {
					MARITAL_STATUS = "1";
				} else if (result[i].value == "W") {
					MARITAL_STATUS = "4";
				} else if (result[i].value == "C") {
					MARITAL_STATUS = "5";
				}

				console.log("MARITAL_STATUS => " + MARITAL_STATUS + "<br> ");
			}
			if (key == "SENDING_FACILITY") {
				SENDING_FACILITY = result[i].value;
				console.log("CCC_NUMBER => " + CCC_NUMBER + " ");
			}
			if (key == "ID") {
				if (result[i + 1].value == "CCC_NUMBER") {
					CCC_NUMBER = result[i].value;
				}
			}
		}

		var enroll_year = ENROLLMENT_DATE.substring(0, 4);
		var enroll_month = ENROLLMENT_DATE.substring(4, 6);
		var enroll_day = ENROLLMENT_DATE.substring(6, 8);
		var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;

		if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
			res.send("Invalid CCC NUMBER");
		}

		db.getConnection(function(err, connection) {
			if (err) {
				console.log(err);
			} else {
				var update_sql =
					"tbl_client SET f_name='" +
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
		var SENDING_FACILITY;

		var CCC_NUMBER;
		var APPOINTMENT_REASON;
		var APPOINTMENT_TYPE;
		var APPOINTMENT_DATE;
		var APPOINTMENT_PLACING_ENTITY;
		var APPOINTMENT_LOCATION;
		var ACTION_CODE;
		var APPOINTMENT_NOTE;
		var APPINTMENT_HONORED;

		var result = get_json(jsonObj);

		for (var i = 0; i < result.length; i++) {
			var key = result[i].key;
			var key_value = result[i].value;
			console.log("Key => " + key + "Value => " + key_value);
			if (key == "SENDING_FACILITY") {
				SENDING_FACILITY = result[i].value;
				console.log("SENDING_FACILITY => " + SENDING_FACILITY + " ");
			}

			if (key == "GODS_NUMBER") {
				//GODS_NUMBER = result[20].value;

				console.log("GODS_NUMBER  => " + GODS_NUMBER + "<br> ");
			} else if (key == "APPOINTMENT_REASON") {
				APPOINTMENT_REASON = result[i].value;
				console.log("APPOINTMENT_REASON  => " + APPOINTMENT_REASON + " ");
			} else if (key == "APPOINTMENT_TYPE") {
				APPOINTMENT_TYPE = result[i].value;
				console.log("APPOINTMENT_TYPE => " + APPOINTMENT_TYPE + " ");
			} else if (key == "APPOINTMENT_LOCATION") {
				APPOINTMENT_LOCATION = result[i].value;
				console.log("APPOINTMENT_LOCATION => " + APPOINTMENT_LOCATION + " ");
			} else if (key == "APPINTMENT_HONORED") {
				APPINTMENT_HONORED = result[i].value;
				console.log("APPINTMENT_HONORED => " + APPINTMENT_HONORED + " ");
			} else if (key == "APPOINTMENT_NOTE") {
				APPOINTMENT_NOTE = result[i].value;
				console.log("APPOINTMENT_NOTE => " + APPOINTMENT_NOTE + " ");
			} else if (key == "ACTION_CODE") {
				ACTION_CODE = result[i].value;
				console.log("ACTION_CODE => " + ACTION_CODE + " ");
			} else if (key == "APPOINTMENT_PLACING_ENTITY") {
				APPOINTMENT_PLACING_ENTITY = result[22].value;
				console.log(
					"APPOINTMENT_PLACING_ENTITY => " +
						APPOINTMENT_PLACING_ENTITY +
						"<br> "
				);
			} else if (key == "APPOINTMENT_DATE") {
				APPOINTMENT_DATE = result[i].value;
				APPOINTMENT_DATE = APPOINTMENT_DATE;

				var year = APPOINTMENT_DATE.substring(0, 4);
				var month = APPOINTMENT_DATE.substring(4, 6);
				var day = APPOINTMENT_DATE.substring(6, 8);

				var app_date = year + "-" + month + "-" + day;

				var current_date = datetime.create();
				var today = current_date.format("Y-m-d");

				var BirthDate = datetime.create(app_date);
				APPOINTMENT_DATE = BirthDate.format("Y-m-d");
				console.log(
					"APPOINTMENT_DATE => " +
						APPOINTMENT_DATE +
						"AND DATE TODAY =>  " +
						today +
						" "
				);
			}
			if (key == "SENDING_FACILITY") {
				SENDING_FACILITY = result[i].value;
				console.log("SENDING_FACILITY => " + SENDING_FACILITY + " ");
			}
			if (key == "ID") {
				if (result[i + 1].value == "CCC_NUMBER") {
					CCC_NUMBER = result[i].value;
				}
			}
		}
		if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
			res.send("Invalid CCC NUMBER");
		}

		db.getConnection(function(err, connection) {
			if (err) {
				console.log("Error Encountered => " + err);
				//process.exit(1);
			} else {
				var response;
				console.log("CLIENTS CCC NUMBER => " + CCC_NUMBER + " END");
				var get_client_sql =
					"Select id from tbl_client where clinic_number='" +
					CCC_NUMBER +
					"' LIMIT 1";

				// Use the connection
				connection.query(get_client_sql, function(error, results, fields) {
					// And done with the connection.

					// Handle error after the release.
					if (error) {
						//throw error;
						response = "Transaction Error => " + error.sqlMessage;
					} else {
						console.log("Results => " + results + "END ");
						for (var res in results) {
							var client_id = results[res].id;
							console.log("Client ID => " + client_id);

							var APP_STATUS = "Booked";
							var ACTIVE_APP = "1";
							var SENDING_APPLICATION =
								jsonObj.MESSAGE_HEADER.SENDING_APPLICATION;
							if (ACTION_CODE == "A") {
								//Add new Appointment
								var appointment_sql =
									"Insert into tbl_appointment (client_id,appntmnt_date,app_type_1,expln_app,app_status,entry_point,active_app,reason) VALUES ('" +
									client_id +
									"', '" +
									APPOINTMENT_DATE +
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

							if (ACTION_CODE == "D") {
								//Delete an Appointment
							}
							if (ACTION_CODE == "U") {
								//Update an Appointment
								var appointment_sql =
									"Update  tbl_appointment SET appntmnt_date='" +
									APPOINTMENT_DATE +
									"' , app_type_1='" +
									APPOINTMENT_TYPE +
									"',reason='" +
									APPOINTMENT_NOTE +
									"',expln_app='" +
									APPOINTMENT_REASON +
									"'  (client_id,appntmnt_date,app_type_1,expln_app,app_status,entry_point,active_app,reason) VALUES ('" +
									client_id +
									"', '" +
									APPOINTMENT_DATE +
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
								} else {
									response = "Success,Patient Update  !!!";
								}

								// Don't use the connection here, it has been returned to the pool.
							});
						}

						response = "Success,Appointment Scheduling !!!";
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

function get_json(jsonObj) {
	var output = [];

	for (var x in jsonObj) {
		if (typeof jsonObj[x] === "object") {
			output = output.concat(get_json(jsonObj[x]));
		} else {
			output.push({
				key: x,
				value: jsonObj[x]
			});
		}
	}

	return output;
}
