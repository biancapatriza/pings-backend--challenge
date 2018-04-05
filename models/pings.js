'use strict';

const db = require('../lib/database');
const response = require('../lib/response');

exports.push = (device_id, epoch_time) =>{
    let data ={
        device_id,
        epoch_time
    }
    return new Promise((resolve, reject)=>{
        db.execute('INSERT INTO pings SET ?', data)
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.delete = () =>{
    // console.log("delete");    
    return new Promise((resolve, reject)=>{
        db.execute('DELETE FROM pings')
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getDevices = () =>{
    return new Promise((resolve, reject) =>{
        let sql = 'SELECT device_id FROM pings';
        db.execute(sql)
        .then((rows)=>{
            resolve(rows);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getByDeviceId = (device_id) =>{
    return new Promise((resolve,reject)=>{
        db.execute('SELECT epoch_time FROM pings WHERE device_id = ?', device_id)
        .then((rows)=>{
            resolve(rows);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getAllEpochs =() =>{
    return new Promise((resolve,reject)=>{
        db.execute("SELECT device_id, epoch_time FROM pings")
        .then((rows)=>{
            resolve(rows);
        }).catch((error)=>{
            reject(error);
        });
    });
};