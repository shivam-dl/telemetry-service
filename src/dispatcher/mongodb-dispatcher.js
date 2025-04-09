const winston = require('winston');
const mongoose = require('mongoose');
const _ = require('lodash');

const TelemetryDataSchema = new mongoose.Schema(
    {
      level: {
        type: String,
        required: true,
      },
      learner_id: {
        type: String,
        required: true,
      },
      event_type: {
        type: String,
        required: true,
      },
      data: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      created_on: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
    {
      collection: 'telemetry_data',
    },
  );

  const TelemetryData = mongoose.model('TelemetryData', TelemetryDataSchema);


class MongoDispatcher extends winston.Transport {
    constructor(options) {
        super();
        this.options = options;
        
        const connectionString = `mongodb://${options.mongoHost}/${options.mongoDb}`;

        mongoose.connect(connectionString).then(() => console.log('Connected to MongoDB successfully')).catch(error => {
            console.error('Error connecting to MongoDB:', error);
            process.exit(1);
        });
    }

    log(level, msg, meta, callback) {
        if(this.options.dataExtract === 'true' && msg.includes('events')) {
            const {events: dataToInsert, deviceDetails} = JSON.parse(msg);
            
            const documents = dataToInsert.map(row => {
                const { level: dataLevel, learner_id, event_type, ...data } = row;
                return {
                    level: dataLevel ?? level,
                    event_type,
                    learner_id,
                    data: {...data, device_details: deviceDetails}
                };
            });

            TelemetryData.insertMany(documents)
                .then(() => {
                    console.log('Multiple documents inserted successfully');
                    callback(null, true);
                })
                .catch(err => {
                    console.error('Error inserting multiple documents:', err);
                    callback(err, null);
                });

        } else {
            const telemetry = new TelemetryData({
                level,
                event_type: msg,
                learner_id: meta.mid,
                data: {}
            });

            telemetry.save()
                .then(() => {
                    callback(null, true);
                })
                .catch(error => {
                    console.error('Error inserting document:', error);
                    callback(error.stack);
                });
        }
    }

    health(callback) {
        if (mongoose.connection.readyState === 1) {
            callback(true);
        } else {
            callback(false);
        }
    }
}

winston.transports.MongoDB = MongoDispatcher;

module.exports = { MongoDispatcher };