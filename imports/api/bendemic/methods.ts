import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import _ from "lodash";
import QRCode from "qrcode"; 
import {
  PatientCollection,
} from "/imports/api/bendemic/collections";
import { Parallax } from "@tsparticles/engine";

Meteor.methods({
  async "bendemic.infect"(status, patient_id) {
    PatientCollection.updateAsync({patient_id: patient_id}, {$set: {status: status}})
  },
  async "bendemic.generate"() {
    let count = 500
    let type
    let patient_id
    let qr_code
    let ben = 20
    let alison = 20

    while (count > 0) {
      console.log("runs")
      type = Random.choice(["ben", "neutral", "alison"])
      if ((ben <= 0 && type == "ben") || (alison <= 0 && type == "alison")) {
        type = "neutral"
      }
      else if (type === "ben") {
        ben -= 1
      }
      else if (type === "alison") {
        alison -= 1
      }
      patient_id = Random.id(10)
      qr_code = await QRCode.toDataURL(Meteor.absoluteUrl("bendemic/" + patient_id))

      PatientCollection.insertAsync({
        qr_code: qr_code,
        status: type,
        patient_id: patient_id,
      });

      count -= 1

    }
    return
  },
});
