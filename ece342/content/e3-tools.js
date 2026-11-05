/* Exam 3 tools (loaded last among the content files): drops units that have no lessons yet. */
(function () {
  'use strict';
  COURSE.units = COURSE.units.filter((u) => u.lessons.length);
})();
