import { model, Schema } from "mongoose"

const School = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    school: { type: String, required: true, trim: true },
  },
  {
    versionKey: false,
  }
)

export default model("school", School)
