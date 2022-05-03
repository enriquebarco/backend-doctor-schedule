const express = require("express");
const router = express.Router();
const fs = require("fs");
const uniqid = require("uniqid");

// function to read doctor information
const readDoctorData = () => {
    const doctorData = fs.readFileSync("./data/doctors.json");
    const doctorDataParsed = JSON.parse(doctorData);
    return doctorDataParsed;
};

// function to find a specific doctor
const findDoctorById = (id) => {
    const doctorData = readDoctorData();
    return doctorData.find((doctor) => id === doctor.id);
}
//function to find list of appointments
const findAllAppointments = (id) => {
    const doctor = findDoctorById(id);
    return doctor.appointments;
};

//function to find list of appointments in a particular day
const findAppointmentByDay = (id, date) => {
    const appointments = findAllAppointments(id);
    return appointments.filter((app) => app.date === date);
}

// function to find a list of appointments by appointment id
const findAppointmentById = (docId, appId) => {
    const appointments = findAllAppointments(docId);
    return appointments.find((app) => app.app_id === appId);
}

// get all doctors
router.get("/", (req,res) => {
    const doctors = readDoctorData();
    res.status(201).json(doctors);
})

// get a particular doctor
router.get("/:id", (req, res) => {
    const id = req.params.id;
    const foundDoctor = findDoctorById(id);
    res.status(201).send(foundDoctor);
})

// get a list of appointments from a particular doctor
router.get("/:id/appointments", (req, res) => {
    const id = req.params.id;
    const appointments = findAllAppointments(id);
    res.status(201).send(appointments);
});

// get a list of appointments for a particular day
router.get("/:id/appointments/:date", (req, res) => {
    const id = req.params.id;
    const date = req.params.date;
    const appointments = findAppointmentByDay(id, date);
    res.status(201).send(appointments);
});

// delete an existing appointment from a doctors calendar
router.delete("/:id/:app_id", (req, res) => {
    const docId = req.params.id;
    const appId = req.params.app_id;

    // get all data which will be manipulated
    const doctorData = readDoctorData();

    // find individual doctor & appointments
    const doctor = doctorData.find((doctor) => docId === doctor.id);
    const allAppointments = doctor.appointments;
    
    //find desired appointment
    const appointment = allAppointments.find((app) => app.app_id === appId);

    // find index of appointment
    const appointmentIndex = allAppointments.indexOf(appointment);

    // remove via index splice
    allAppointments.splice(appointmentIndex, 1);

    //rewrite data into the json file, including mutated array
    fs.writeFileSync("./data/doctors.json", JSON.stringify(doctorData));

    //send response
    res.status(202).send("appointment deleted")
});

// add a new appointment to a doctors calendar 
router.post("/:id/new-appointment", (req, res) => {

    const id = req.params.id

    const {firstName, lastName, date, time, kind} = req.body
    
    const newAppointment = {
        app_id: uniqid(),
        firstName,
        lastName,
        date,
        time,
        kind
    };

    // get all doctor data
    const doctorData = readDoctorData();

    // find specific doctor and appointment
    const doctor = doctorData.find((doctor) => id === doctor.id);
    const allAppointments = doctor.appointments;

    //check if doctor has more than 3 appointments at the same time
    const similarAppointments = allAppointments.filter((app) => {
        if(app.date === date && app.time === time) {
            return app
        }
    });

    if(similarAppointments.length > 2 ) {
        res.status(404).send("Doctor already has 3 appointments at this time");
        return;
    }

    // check if the time is valid
    const validTimes = ["00","15", "30", "45"];
    const getMinutes = time.slice(2,4);

    if(!validTimes.includes(getMinutes)) {
        res.status(404).send("Not a valid time slot - please schedule by 15 minute intervals");
        return;
    }
    

    // push new appointment into array
    allAppointments.push(newAppointment);

    console.log(allAppointments);

    // write into data
    fs.writeFileSync("./data/doctors.json", JSON.stringify(doctorData));

    // respond with new data
    res.status(201).json(newAppointment);
});



module.exports = router;