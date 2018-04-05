const express = require('express');
const router = express.Router();
const moment = require('moment');
const isTimestamp = require('validate.io-timestamp');
const pings = require('../models/pings');

/*
* Filtering of data into a single array
*/
function filterData(arr){
    let data_array = [];
    for(let i=0; i<arr.length;i++){
        if(data_array.indexOf(arr[i]) ==-1){
            data_array.push(arr[i])
        }
    }
    return data_array
}


/*
* Adding pings
*/
router.post('/:device_id/:epoch_time', function (req,res,next){
    pings.push(req.params.device_id, req.params.epoch_time).then(data=>{
        res.json(data);
    }).catch(error=>{
        res.json(error);
    });
});

/*
* Clear data
*/
router.post('/clear_data', function(req,res,next){
    pings.delete().then(data=>{
        res.json(data);
    }).catch(error=>{
        res.json(error);  
    });
});

/*
* Get all device id in pings
*/
router.get('/devices', function(req,res,next){
    pings.getDevices().then(data=>{
        let arr =[];
        data['data'].forEach(element => {
            arr.push(element.device_id)
        });
        res.send(
            filterData(arr)
        );
    }).catch(error=>{
        res.json(error);
    });
});

/*
* Get all epochs of each devices on specific date
*/
router.get('/all/:date', function(req,res, next){
    pings.getAllEpochs().then(data =>{
        let deviceArr = [];//--> will simplify array of the devies
        let paramDate = moment(req.params.date).format('YYYY-MM-DD');
        data['data'].forEach(ping => {
            deviceArr.push(ping.device_id)
        });
        let filterDevice = filterData(deviceArr);
        let allDevices = {};//-->will get the desired output
        filterDevice.forEach(elem =>{
            allDevices[elem]=[];
            let epochTime = [];//--> will simplify array of the epoch_time per devices
            data['data'].forEach(epoch =>{
                if(elem == epoch.device_id){
                    epochTime.push(epoch.epoch_time);
                }
            });
            epochTime.forEach(epoch =>{
                let formatEpoch = moment.unix(epoch).utc().format('YYYY-MM-DD');
                if(formatEpoch == paramDate){
                    allDevices[elem].push(epoch);
                }
            });
        });
        res.json(allDevices);
    }).catch(error=>{
        res.json(error);
    })
});

/*
* Get all epochs of each devices on a range of time
*/
router.get('/all/:from/:to', function(req,res,next){
    pings.getAllEpochs().then(data =>{
        let deviceArr = [];//--> will simplify array of the devices
        let from = isTimestamp(Number(req.params.from))?moment.unix(req.params.from).utc().format('YYYY-MM-DD HH:mm:ss'):moment(req.params.from).format('YYYY-MM-DD');
        let to = isTimestamp(Number(req.params.to))?moment.unix(req.params.to).utc().format('YYYY-MM-DD HH:mm:ss'):moment(req.params.to).format('YYYY-MM-DD');        
        let allDevices = {};//-->will get the desired output

        data['data'].forEach(ping => {
            deviceArr.push(ping.device_id)
        });
        let filterDevice = filterData(deviceArr);
        filterDevice.forEach(elem =>{
            allDevices[elem]=[];
            let epochTime = [];//--> will simplify array of the epoch for each device
            data['data'].forEach(epoch =>{
                if(elem == epoch.device_id){
                    epochTime.push(epoch.epoch_time);
                }
            });
            epochTime.forEach(epoch =>{
                let formatEpoch = moment.unix(epoch).utc().format('YYYY-MM-DD HH:mm:ss');
                if(isTimestamp(from) || isTimestamp(to)){
                    if((formatEpoch >= from) && (formatEpoch<=to)){
                        allDevices[elem].push(epoch);
                    }
                }else{
                    if((formatEpoch >= from) && (formatEpoch<to)){
                        allDevices[elem].push(epoch);
                    }
                }
            });
        })
        res.json(allDevices);
    }).catch(error=>{
        res.json(error);
    });
});

/*
* Get all epoch time of a specific device on a specific date
*/
router.get('/:deviceId/:date', function(req,res,next){
    pings.getByDeviceId(req.params.deviceId).then(data=>{
        let paramDate = moment(req.params.date).format('YYYY-MM-DD');
        let arr = [];//--> will simplify array of the data
        data['data'].forEach(element => {
            arr.push(element.epoch_time)
        });
        epochArr = filterData(arr);
        let filterDate = [];//-->will get the desired output
        epochArr.forEach(epoch =>{
            let formatDate = moment.unix(epoch).utc().format('YYYY-MM-DD') ;
            if(formatDate == paramDate){
                filterDate.push(epoch);
            }
        });
        res.send(filterDate);
    }).catch(error=>{
        res.json(error);
    });
    
});



/*
* Get all epoch time for a specific device on a range of time
*/
router.get('/:deviceId/:from/:to', function(req,res,next){
    pings.getByDeviceId(req.params.deviceId).then(data=>{
        let from = isTimestamp(Number(req.params.from))? moment.unix(req.params.from).utc().format('YYYY-MM-DD HH:mm:ss') : moment(req.params.from).format('YYYY-MM-DD 00:00:00');    
        let to = isTimestamp(Number(req.params.to))? moment.unix(req.params.to).utc().format('YYYY-MM-DD HH:mm:ss') : moment(req.params.to).format('YYYY-MM-DD 00:00:00');
        let arr = [];//--> will simplify array of the data
        data['data'].forEach(element => {
            arr.push(element.epoch_time)
        });
        let filterDate = [];//-->will get all the epoch_time filtered
        arr.forEach(epoch =>{
            let formatEpoch = moment.unix(epoch).utc().format('YYYY-MM-DD HH:mm:ss');
            if(isTimestamp(from) || isTimestamp(to)){
                if((formatEpoch >= from) && (formatEpoch<=to)){
                    filterDate.push(epoch);
                }
            }else{
                if((formatEpoch >= from) && (formatEpoch < to)){
                    filterDate.push(epoch);
                }
            }
        });
        res.send(filterDate);
    }).catch(error=>{
        res.json(error);
    });
});






module.exports = router;
