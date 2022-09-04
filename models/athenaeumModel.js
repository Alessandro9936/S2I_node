const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const athenaeumSchema = new Schema(
  {
    name: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

athenaeumSchema.static(
  "addCourseRelation",
  async function (athenaeumID, course) {
    try {
      await this.findByIdAndUpdate(athenaeumID, { $push: { courses: course } });
    } catch (err) {
      throw err;
    }
  }
);

athenaeumSchema.static(
  "removeCourseRelation",
  async function (athenaeumID, course) {
    try {
      await this.findByIdAndUpdate(athenaeumID, { $pull: { courses: course } });
    } catch (err) {
      throw err;
    }
  }
);

/**
 * Loop through existing athenaeums to add or remove course depending if there is a relation or not after changes
 * @param {object} oldCourse course before any update
 * @param {object} newCourse course after updates
 */

athenaeumSchema.static("updateCourses", async function (oldCourse, newCourse) {
  try {
    // Retrieve all athenaeums in database and select only courses arrays
    const coursesInAthenaeums = await this.find({}, "courses");

    coursesInAthenaeums.forEach(async (course) => {
      if (
        oldCourse.athenaeums.includes(course._id) &&
        !newCourse.athenaeums.includes(course._id)
      ) {
        await this.findByIdAndUpdate(course._id, {
          $pull: { courses: newCourse._id },
        });
      }

      if (
        !oldCourse.athenaeums.includes(course._id) &&
        newCourse.athenaeums.includes(course._id)
      ) {
        await this.findByIdAndUpdate(course._id, {
          $push: { courses: newCourse._id },
        });
      }
    });
  } catch (err) {
    throw err;
  }
});

athenaeumSchema.virtual("url").get(function () {
  return "/athenaeums/" + this._id;
});

module.exports = mongoose.model("Athenaeum", athenaeumSchema);
