const mongoose = require("mongoose");
const { Schema } = mongoose;

const groupSchema = new Schema(
    {
        emailAdmin: {
            type: "string",
            required: true,
        },
        emailMember: {
            type: "string",
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Group = mongoose.model("group", groupSchema);

module.exports = Group;
