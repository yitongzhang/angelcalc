// Define Global Variables from calc_table
window.onload = function onload() {
  optionShares = 0;
  totNoteShares = 0; 
  commonShares = 0;
  vcShares = 0;
  i = 0;

  // console.log('initial optionShares: ' + optionShares);
  calc_table();
  addNumberFormatting();
}

// Create a new object and push into Array for each note that is detected
var noteArray = new Array();
function createNoteArray(noteList) {
  noteArray = new Array();
  for (var i=0; i < noteList.length; i++) {
    // console.log(noteList[i])
    $('#'+noteList[i]).each(function () { 
        var vals = {noteID: noteList[i],
                    yourInvestment: 0,
                    totInvestment: 0,
                    noteDiscount: 0,
                    noteCap: 0,
                    price: 0, 
                    shares: 0, 
                    percentage: 0,
                    yourShares: 0,
                    yourPercentage: 0};
        noteArray.push(vals)
    })
  }

  //Identifying through class convNote
  // console.log(noteArray);
}

function calc_table() {
  yourInvestment_VC = parseInput($('input[name="yourInvestment_VC"]'));
  totInvestment_VC = parseInput($('input[name="totInvestment_VC"]'));
  postOptionPercent = parseInput($('input[name="postOptionPercent"]')) / 100;
  valuation = parseInput($('input[name="valuation"]'));
  fdPreShares = parseInput($('input[name="fdPreShares"]'));
  unallocOptionShares = parseInput($('input[name="unallocOptionShares"]'));

  // Compute Variables
  // this might be a problem with calculation down the line...
  commonShares = (fdPreShares - unallocOptionShares) || 0;
  preValuation = (valuation - totInvestment_VC);
  postValuation = valuation;

  PPS_VC = calc_vcPPS(preValuation, fdPreShares, unallocOptionShares, optionShares, totNoteShares);
  vcShares = calc_SharesPPS(totInvestment_VC, PPS_VC);
  fdPostShares = (commonShares + vcShares + totNoteShares + optionShares) || 0;

  // calculate the PPS, shares, percentage and total shares of all converted notes for each note we have present
  totNoteShares = 0;
  for (var i=0; i < noteArray.length; i++) {
    // Define note variables
    noteArray[i].yourInvestment = parseInput($('#YCStandardSAFE'+(i+1)+' input[name="YCSAFE_yourInvestment_note"]'));
    noteArray[i].totInvestment = parseInput($('#YCStandardSAFE'+(i+1)+' input[name="YCSAFE_totalInvestment_note"]'));
    noteArray[i].noteDiscount = parseInput($('#YCStandardSAFE'+(i+1)+' input[name="YCSAFE_noteDiscount"]')) / 100;
    noteArray[i].noteCap = parseInput($('#YCStandardSAFE'+(i+1)+' input[name="YCSAFE_noteCap"]'));

    // Calculating the info for each note
    noteArray[i].price = Math.min(calc_notePPS(noteArray[i].noteCap, fdPreShares, unallocOptionShares, optionShares, PPS_VC, noteArray[i].noteDiscount), calc_notePPS_discount(PPS_VC, noteArray[i].noteDiscount));
    noteArray[i].shares = calc_SharesPPS(noteArray[i].totInvestment, noteArray[i].price);
    noteArray[i].percentage = calc_percentage(fdPostShares, noteArray[i].shares);
    noteArray[i].yourShares = calc_SharesPPS(noteArray[i].yourInvestment, noteArray[i].price);
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

function addNumberFormatting() {
  // Adding formatting to input value
  $('input.number').keyup(function(event) {
    // skip for arrow keys
    if(event.which >= 37 && event.which <= 40) return;

    // format number
    $(this).val(function(index, value) {
      return addComma(value);
    });
  });
}

// Update Tables
function update_tables() {
  // Input Table
  $('.preVal .updateValue').html(numberFormat(parseFloat(preValuation).toFixed(2)));
  $('.postVal .updateValue').html(numberFormat(parseFloat(postValuation).toFixed(2)));
  $('.fdPostShares .updateValue').html(numberFormat(parseFloat(fdPostShares).toFixed(0)));
  $('.optionShares .updateValue').html(numberFormat(parseFloat(optionShares).toFixed(0)));
  $('.sharePriceCom .updateValue').html(toPercent(numberFormat(parseFloat(PPS_VC))).toFixed(2));
  
  // Common Shares
  $('.sharesSituation .commonRow .priceShare').html(numberFormat(parseFloat(PPS_VC).toFixed(2)));
  $('.sharesSituation .commonRow .shares').html(numberFormat(parseFloat(commonShares).toFixed(0)));
  $('.sharesSituation .commonRow .percentage').html(toPercent(numberFormat(parseFloat(commonPercent))).toFixed(2));

  // Option Pool
  $('.sharesSituation .optionpoolRow .priceShare').html(numberFormat(parseFloat('N/A').toFixed(0)));
  $('.sharesSituation .optionpoolRow .shares').html(numberFormat(parseFloat(optionShares).toFixed(0)));
  $('.sharesSituation .optionpoolRow .percentage').html(toPercent(numberFormat(parseFloat(optionPercent))).toFixed(2));

  // VC Shares
  $('.sharesSituation .vcRow .priceShare').html(numberFormat(parseFloat(PPS_VC).toFixed(2)));
  $('.sharesSituation .vcRow .shares').html(numberFormat(parseFloat(vcShares).toFixed(0)));
  $('.sharesSituation .vcRow .percentage').html(toPercent(numberFormat(parseFloat(vcPercent))).toFixed(2));

  // Your VC Shares
  $('.sharesSituation .yourPortionVC .priceShare').html(numberFormat(parseFloat(PPS_VC).toFixed(2)));
  $('.sharesSituation .yourPortionVC .shares').html(numberFormat(parseFloat(yourShares_VC).toFixed(0)));
  $('.sharesSituation .yourPortionVC .percentage').html(toPercent(numberFormat(parseFloat(yourPercentage_VC))).toFixed(2));

  // iternate through each SAFE
  for (var i=0; i < noteArray.length; i++) {
    // SAFE Shares
    $('#safeYCStandardSAFE'+(i+1)+'Row .priceShare').html(numberFormat(parseFloat(noteArray[i].price).toFixed(2)));
    $('#safeYCStandardSAFE'+(i+1)+'Row .shares').html(numberFormat(parseFloat(noteArray[i].shares).toFixed(0)));
    $('#safeYCStandardSAFE'+(i+1)+'Row .percentage').html(toPercent(numberFormat(parseFloat(noteArray[i].percentage))).toFixed(2));

    // Your SAFE Shares
    $('#yourSafeYCStandardSAFE'+(i+1)+'Row .priceShare').html(numberFormat(parseFloat(noteArray[i].price).toFixed(2)));
    $('#yourSafeYCStandardSAFE'+(i+1)+'Row .shares').html(numberFormat(parseFloat(noteArray[i].yourShares).toFixed(0)));
    $('#yourSafeYCStandardSAFE'+(i+1)+'Row .percentage').html(toPercent(numberFormat(parseFloat(noteArray[i].yourPercentage))).toFixed(2));    
  }
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
  // console.log()
}

// add comma at every three 0's
function numberFormat(x){
  // console.log(x)
  // console.log(typeof(x))
  if (x == "NaN") {
    return "n/a"
  }
  else{
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
}

function toPercent(x) {
  return x * 100;
}