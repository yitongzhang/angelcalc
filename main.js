// // Define Global Variables from calc_table
window.onload = function onload() {
  optionShares = 0;
  totNoteShares = 0; 
  commonShares = 0;
  vcShares = 0;
  i = 0;

  console.log('initial optionShares: ' + optionShares);
  calc_table();
}

// Create a new object and push into Array for each note that is detected
var noteArray = new Array();
//Identifying through class convNote
$(".convNote").each(function () { 
    var vals = {price: 0, 
                shares: 0, 
                percentage: 0,
                yourShares: 0,
                yourPercentage: 0};
    noteArray.push(vals)
})
console.log(noteArray);

function calc_table() {
  yourInvestment_VC = parseInput($('input[name="yourInvestment_VC"]'));
  totInvestment_VC = parseInput($('input[name="totInvestment_VC"]'));
  postOptionPercent = parseInput($('input[name="postOptionPercent"]')) / 100;
  valuation = parseInput($('input[name="valuation"]'));
  fdPreShares = parseInput($('input[name="fdPreShares"]'));
  unallocOptionShares = parseInput($('input[name="unallocOptionShares"]'));

  // Define note variables
  yourInvestment_note = parseInput($('input[name="yourInvestment_note"]'));
  totInvestment_note = parseInput($('input[name="totalInvestment_note"]'));
  noteDiscount = parseInput($('input[name="noteDiscount"]')) / 100;
  noteCap = parseInput($('input[name="noteCap"]'));

  // Compute Variables
  // this might be a problem with calculation down the line...
  commonShares = (fdPreShares - unallocOptionShares) || 0;
  preValuation = (valuation - totInvestment_VC);
  postValuation = valuation;

  PPS_VC = calc_vcPPS(preValuation, fdPreShares, unallocOptionShares, optionShares, totNoteShares);
  PPS_note = calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares, PPS_VC, noteDiscount); // PPS = price per share
  PPS_noteDiscount = calc_notePPS_discount(PPS_VC, noteDiscount);
  PPS_note = Math.min(PPS_note, PPS_noteDiscount);

  vcShares = calc_SharesPPS(totInvestment_VC, PPS_VC);
  fdPostShares = (commonShares + vcShares + totNoteShares + optionShares) || 0;

  // calculate the PPS, shares, percentage and total shares of all converted notes for each note we have present
  totNoteShares = 0;
  for (var i=0; i < noteArray.length; i++) {
    noteArray[i].price = Math.min(calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares, PPS_VC, noteDiscount), calc_notePPS_discount(PPS_VC, noteDiscount));
    noteArray[i].shares = calc_SharesPPS(totInvestment_note, noteArray[i].price);
    noteArray[i].percentage = calc_percentage(fdPostShares, noteArray[i].shares);
    noteArray[i].yourShares = calc_SharesPPS(yourInvestment_note, noteArray[i].price);
    noteArray[i].yourPercentage = calc_percentage(fdPostShares, noteArray[i].yourShares);

    totNoteShares += noteArray[i].shares;
  }

  commonPercent = calc_percentage(fdPostShares, commonShares);
  vcPercent = calc_percentage(fdPostShares, vcShares);
  totNotePercent = calc_percentage(fdPostShares, totNoteShares);
  optionPercent = calc_percentage(fdPostShares, optionShares);
  yourShares_VC = calc_SharesPPS(yourInvestment_VC, PPS_VC);
  yourPercentage_VC = calc_percentage(fdPostShares, yourShares_VC);
}

// Calculate
$('#inputs').on('input', function() {
  // Calculation and Optimization
  optimize();

  // Update tables
  update_tables();
  lightUpOutput();
});


// Optimization Function
// Goal seeking method for calculating number of options we need to issue to in order to achieve our option pool and VC equity target
function optimize() {
  // reset optionShares
  optionShares = 0;
  // Define initial variables
  calc_table();
  totaldiff = postOptionPercent - optionPercent; //0.05
  descentFactor = fdPreShares * 0.05;
  var i = 0;
  var direction = 1;
  while (i<100) {
    calc_table();
    newtotaldiff = Math.abs(postOptionPercent - optionPercent); //0.05
    if (newtotaldiff < 0.000001) {
      break;
    }
    optionShares = (optionShares + descentFactor * direction) || 0;
    if (optionPercent >= postOptionPercent) {
      currentdir = -1; // decrease
    } else {
      currentdir = 1; // increase
    }
    if (currentdir == direction) {
    } else {
      descentFactor = Math.max(descentFactor / 2, 1);
      direction = direction * -1;
    }
    i++;
  };
}

function calc_com_shares(fd_pre_shares, unallocated_pre_opt) {
  return (fd_pre_shares - unallocated_pre_opt) || 0;
}

function calc_SharesPPS(investment, price) {
  shares = (investment / price);
  return isFinite(shares) && shares || 0;
}

function calc_percentage(fd_post_shares, shares) {
  return (shares / fd_post_shares) || 0;
}

function calc_vcPPS(pre_valuation, fd_pre_shares, unallocated_pre_opt, optpool_shares, total_note_shares) {
  return (pre_valuation / (fd_pre_shares - unallocated_pre_opt + optpool_shares + total_note_shares)) || 0;
}

function calc_notePPS(note_cap, fd_pre_shares, unallocated_pre_opt, optpool_shares, PPS_VC, noteDiscount) {
  return (note_cap / (fd_pre_shares - unallocated_pre_opt + optpool_shares)) || 0;
}

function calc_notePPS_discount(PPS_VC, noteDiscount) {
  return (PPS_VC * (1 - noteDiscount));
}

// Adding formatting to input value
$('input.number').keyup(function(event) {
  // skip for arrow keys
  if(event.which >= 37 && event.which <= 40) return;

  // format number
  $(this).val(function(index, value) {
    return addComma(value);
  });
});

// Update Tables
function update_tables() {
  // Input Table
  $('.preVal .updateValue').html(numberFormat(parseFloat(preValuation).toFixed(2)));
  $('.postVal .updateValue').html(numberFormat(parseFloat(postValuation).toFixed(2)));
  $('.fdPostShares .updateValue').html(numberFormat(parseFloat(fdPostShares).toFixed(0)));
  $('.optionShares .updateValue').html(numberFormat(parseFloat(optionShares).toFixed(0)));
  $('.sharePriceCom .updateValue').html(numberFormat(parseFloat(PPS_VC).toFixed(2)));
  
  // Input sharesSituation
  // Common Shares
  $('.sharesSituation .commonRow .priceShare').html(numberFormat(parseFloat(PPS_VC).toFixed(2)));
  $('.sharesSituation .commonRow .shares').html(numberFormat(parseFloat(commonShares).toFixed(0)));
  $('.sharesSituation .commonRow .percentage').html(numberFormat(parseFloat(commonPercent).toFixed(2)));

  // Option Pool
  $('.sharesSituation .optionpoolRow .priceShare').html(numberFormat(parseFloat('N/A').toFixed(0)));
  $('.sharesSituation .optionpoolRow .shares').html(numberFormat(parseFloat(optionShares).toFixed(0)));
  $('.sharesSituation .optionpoolRow .percentage').html(numberFormat(parseFloat(optionPercent).toFixed(2)));

  // VC Shares
  $('.sharesSituation .vcRow .priceShare').html(numberFormat(parseFloat(PPS_VC).toFixed(2)));
  $('.sharesSituation .vcRow .shares').html(numberFormat(parseFloat(vcShares).toFixed(0)));
  $('.sharesSituation .vcRow .percentage').html(numberFormat(parseFloat(vcPercent).toFixed(2)));

  // SAFE Shares
  $('.sharesSituation .safeRow .priceShare').html(numberFormat(parseFloat(PPS_note).toFixed(2)));
  $('.sharesSituation .safeRow .shares').html(numberFormat(parseFloat(totNoteShares).toFixed(0)));
  $('.sharesSituation .safeRow .percentage').html(numberFormat(parseFloat(totNotePercent).toFixed(2)));

  // Your SAFE Shares
  $('.sharesSituation .yourPortionSafe .priceShare').html(numberFormat(parseFloat(PPS_note).toFixed(2)));
  $('.sharesSituation .yourPortionSafe .shares').html(numberFormat(parseFloat(noteArray[0].yourShares).toFixed(0)));
  $('.sharesSituation .yourPortionSafe .percentage').html(numberFormat(parseFloat(noteArray[0].yourPercentage).toFixed(2)));

}

// Non Core Functions ---------------------------------------------------------
// Comma Format
function parseInput(value) {
  return parseFloat(removeComma(value.val()));
}

function addComma(value) {
  return value
  .replace(/\D/g, "")
  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  ;
}

function removeComma(x) {
    return x.toString().replace(/,/g, "");
}

function lightUpOutput(){
  $('.outputFields td').css('opacity',"1");
  console.log()
}

// add comma at every three 0's
function numberFormat(x){
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}