require("dotenv").config();
const mqtt = require("async-mqtt")
const {v4: uuidv4} = require("uuid")
//const gpio = require("pigpio").gpio

const mqttClient = mqtt.connect(process.env.MQTT_URI, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
})
mqttClient.on("connect", () => {
    console.log("connected to broker");
    mqttClient.subscribe("eskeeta/userid/topicid", () => {
        console.log("subscribed to notification topic");
    })
})
mqttClient.on("message", async (topic,payload) => {
    let device = JSON.parse(payload.toString())

    let res = {
        agentUserId: device.userId,
        requestId: uuidv4(),
        payload: {
            devices: {
                states: {
                }
            }
        }
    }

    device.execution.forEach(execution => {
        if(execution.command == "action.devices.commands.OnOff"){
            //execute onoff
            res.payload.devices.states[device.id] = execution.params
        }if(execution.command == "action.devices.commands.AbsoluteBrightness"){
            //execute brightness
            res.payload.devices.states[device.id] = execution.params
        }
    })
    
    mqttClient.publish("eskeeta/notification/userid",JSON.stringify(res))
})