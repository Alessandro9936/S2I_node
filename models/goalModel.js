const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const goalSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

goalSchema.static("addCourseRelation", async function (goalID, course) {
  try {
    await this.findByIdAndUpdate(goalID, { $push: { courses: course } });
  } catch (err) {
    throw err;
  }
});

goalSchema.static("removeCourseRelation", async function (goalID, course) {
  try {
    await this.findByIdAndUpdate(goalID, { $pull: { courses: course } });
  } catch (err) {
    throw err;
  }
});

/**
 * Loop through existing goals to add or remove course depending if there is a relation or not after changes
 * @param {object} oldCourse course before any update
 * @param {object} newCourse course after updates
 */

goalSchema.static("updateCourses", async function (oldCourse, newCourse) {
  try {
    // Retrieve all goals in database and select only courses arrays
    const coursesInGoals = await this.find({}, "courses");

    coursesInGoals.forEach(async (course) => {
      if (
        oldCourse.goals.includes(course._id) &&
        !newCourse.goals.includes(course._id)
      ) {
        await this.findByIdAndUpdate(course._id, {
          $pull: { courses: newCourse._id },
        });
      }

      if (
        !oldCourse.goals.includes(course._id) &&
        newCourse.goals.includes(course._id)
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

goalSchema.virtual("url").get(function () {
  return "/goals/" + this._id;
});

module.exports = mongoose.model("Goal", goalSchema);
