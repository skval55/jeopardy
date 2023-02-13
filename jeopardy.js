// categories is the main data structure for the app; it looks like this:

// http://jservice.io/api/random?count=6
// https://jservice.io/api/category?id=***

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const usedIds = [];
let categories = [];
let ids = [];

let startBtn = document.getElementById("start");
const tableHead = document.querySelector("thead");
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds(response) {
  ids = [];
  for (let i = 0; i < 6; i++) {
    let catId = response.data[i].category_id;
    if (!usedIds.includes(catId)) {
      usedIds.push(catId);
      ids.push(catId);
    } else {
      let newCat = await axios.get("https://jservice.io/api/random?count=1");
      let newCatId = newCat.data[0].category_id;
      console.log("new", newCatId);
      usedIds.push(newCatId);
      ids.push(newCatId);
    }
  }
  getCategory(ids);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

// make way to pull 5 random questions instead of first 5
async function getCategory(catId) {
  for (let i = 0; i < catId.length; i++) {
    let category = { clues: [] };
    let response =
      await axios.get(`https://jservice.io/api/category?id=${catId[i]}
        `);
    const clues = response.data.clues;
    category.title = response.data.title;
    for (let i = 0; i < clues.length; i++) {
      const clue = {};
      clue.question = clues[i].question;
      clue.answer = clues[i].answer;
      clue.showing = null;
      category.clues.push(clue);
    }
    categories.push(category);
  }
  fillTable(categories);
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
function fillTable(categories) {
  const tr = document.createElement("tr");
  tableHead.append(tr);
  for (let i = 0; i < 5; i++) {
    $("tbody").append(`<tr class="${i}"></tr>`);
  }

  for (let i = 0; i < categories.length; i++) {
    $("thead tr").append(
      `<td class="${i} px-1 border border-warning bg-dark rounded categories py-2 col-2">${categories[i].title}</td>`
    );
    for (let y = 0; y < 5; y++) {
      //   give ids according to row and column so we can itterate over later
      $(`tbody .${y}`).append(
        `<td id="${i}-${y}" class="clues rounded ">?</td>`
      );
    }
  }
  $("#spin-container").hide();
  $("#start").text("Reset Game!");
  startBtn.addEventListener("click", setupAndStart);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

$("tbody").click(function handleClick(evt) {
  const position = evt.target.id;
  const col = position[0];
  const row = position[2];
  //   console.log(position);
  //   console.log("here", categories[col].clues[row]);
  try {
    if (categories[col].clues[row].showing === null) {
      categories[col].clues[row].showing = "question";
      $(`#${position}`).text(`${categories[col].clues[row].question}`);
    } else if (categories[col].clues[row].showing === "question") {
      categories[col].clues[row].showing = "answer";
      $(`#${position}`).html(`${categories[col].clues[row].answer}`);
      $(`#${position}`).removeClass("clues").addClass("answer");
    }
  } catch (error) {
    $(`#${position}`).text(`no question :/`);
    $(`#${position}`).removeClass("clues").addClass("answer");
  }
  //   console.log(categories[col].clues[row].showing);
});

// function handleClick(evt) {

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("thead").html("");
  $("tbody").html("");
}

/** Remove the loading spinner and update the button used to fetch data. */

// function hideLoadingView() {}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table **************
 * */
// makes it so user can't click more than once before it loads and the spinner will show

async function setupAndStart() {
  startBtn.removeEventListener("click", setupAndStart);
  $("#spin-container").show();
  $("#start").text("LOADING...");
  //   });
  showLoadingView();
  categories = [];
  let response = await axios.get("https://jservice.io/api/random?count=6");
  categories = [];
  getCategoryIds(response);
}

/** On click of start / restart button, set up game. */

startBtn.addEventListener("click", setupAndStart);
// TODO

/** On page load, add event handler for clicking clues */
$("#spin-container").hide();
// $(window).on("load", function () {
//   $("#spin-container").hide();
// });
// TODO
