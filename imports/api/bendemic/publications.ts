import { Meteor } from "meteor/meteor";
import {
  PatientCollection,
} from "/imports/api/bendemic/collections";
import _ from "lodash";

Meteor.publish("bendemic.patients", function () {
  return PatientCollection.find({});
});

Meteor.publish("bendemic.patient", function (patientId: string) {
  return PatientCollection.find({ patient_id: patientId })
});

