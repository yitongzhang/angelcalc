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

var noteArray = new Array();
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
  yourInvestment_VC = parseFloat($('input[name="angelInvestment"]').val());
  totInvestment_VC = parseFloat($('input[name="totInvestment_VC"]').val());
  postOptionPercent = parseFloat($('input[name="postOptionPercent"]').val()) / 100;
  valuation = parseFloat($('input[name="valuation"]').val());
  fdPreShares = parseFloat($('input[name="fdPreShares"]').val());
  unallocOptionShares = parseFloat($('input[name="unallocOptionShares"]').val());

  // Define note variables
  yourInvestment_note = parseFloat($('input[name="yourInvestment_note"]').val());
  totInvestment_note = parseFloat($('input[name="totalInvestment_note"]').val());
  noteDiscount = parseFloat($('input[name="noteDiscount"]').val()) / 100;
  noteCap = parseFloat($('input[name="noteCap"]').val());

  // Compute Variables
  // this might be a problem with calculation down the line...
  commonShares = (fdPreShares - unallocOptionShares) || 0;
  preValuation = (valuation - totInvestment_VC);
  postValuation = valuation;

  PPS_VC = calc_vcPPS(preValuation, fdPreShares, unallocOptionShares, optionShares, totNoteShares);
  PPS_note = calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares, PPS_VC, noteDiscount); // PPS = price per share
  PPS_noteDiscount = calc_notePPS_discount(PPS_VC, noteDiscount);
  PPS_note = Math.min(PPS_note, PPS_noteDiscount);

  vcShares = calc_vcShares(totInvestment_VC, PPS_VC) || 0;
  fdPostShares = (commonShares + vcShares + totNoteShares + optionShares) || 0;

  // calculate the PPS, shares, percentage and total shares of all converted notes for each note we have present
  totNoteShares = 0;
  for (var i=0; i < noteArray.length; i++) {
    noteArray[i].price = Math.min(calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares, PPS_VC, noteDiscount), calc_notePPS_discount(PPS_VC, noteDiscount));
    noteArray[i].shares = calc_noteShares(totInvestment_note, noteArray[i].price) || 0;
    noteArray[i].percentage = calc_percentage(fdPostShares, noteArray[i].shares) || 0;
    noteArray[i].yourShares = calc_yourShares_note(yourInvestment_note, noteArray[i].price);
    noteArray[i].yourPercentage = calc_percentage(fdPostShares, noteArray[i].yourShares);

    totNoteShares += noteArray[i].shares;
  }

  // totNoteShares = calc_noteShares(totInvestment_note, PPS_note) || 0;
  commonPercent = calc_percentage(fdPostShares, commonShares);
  vcPercent = calc_percentage(fdPostShares, vcShares);
  totNotePercent = calc_percentage(fdPostShares, totNoteShares);
  optionPercent = calc_percentage(fdPostShares, optionShares);
  // yourShares_note = calc_yourShares_note(yourInvestment_note, PPS_note);
  // yourSharesPercent_note = calc_percentage(fdPostShares, yourShares_note);
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

function calc_vcShares(vc_investment, price_per_share) {
  vcShares = (vc_investment / price_per_share)
  return isFinite(vcShares) && vcShares || 0;
}

function calc_noteShares(total_note_investment, note_price_per_share) {
  noteShares = (total_note_investment / note_price_per_share)
  return isFinite(noteShares) && noteShares || 0;
}

function calc_yourShares_note(yourInvestment_note, note_price_per_share) {
  yourShares = (yourInvestment_note / note_price_per_share)
  return isFinite(yourShares) && yourShares || 0;
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
  $('.sharesSituation .commonRow .percentage').html(numberFormat(parseFloat(commonPercent).toFixed(1)));

  // Option Pool
  $('.sharesSituation .optionpoolRow .priceShare').html(numberFormat(parseFloat('N/A').toFixed(0)));
  $('.sharesSituation .optionpoolRow .shares').html(numberFormat(parseFloat(optionShares).toFixed(0)));
  $('.sharesSituation .optionpoolRow .percentage').html(numberFormat(parseFloat(optionPercent).toFixed(1)));

  // VC Shares
  $('.sharesSituation .vcRow .priceShare').html(numberFormat(parseFloat(PPS_VC).toFixed(2)));
  $('.sharesSituation .vcRow .shares').html(numberFormat(parseFloat(vcShares).toFixed(0)));
  $('.sharesSituation .vcRow .percentage').html(numberFormat(parseFloat(vcPercent).toFixed(1)));

  // SAFE Shares
  $('.sharesSituation .safeRow .priceShare').html(numberFormat(parseFloat(PPS_note).toFixed(2)));
  $('.sharesSituation .safeRow .shares').html(numberFormat(parseFloat(totNoteShares).toFixed(0)));
  $('.sharesSituation .safeRow .percentage').html(numberFormat(parseFloat(totNotePercent).toFixed(1)));

  // Your SAFE Shares
  $('.sharesSituation .yourPortionSafe .priceShare').html(numberFormat(parseFloat(PPS_note).toFixed(2)));
  $('.sharesSituation .yourPortionSafe .shares').html(numberFormat(parseFloat(yourShares_note).toFixed(0)));
  $('.sharesSituation .yourPortionSafe .percentage').html(numberFormat(parseFloat(yourSharesPercent_note).toFixed(1)));

}

// Non Core Functions ---------------------------------------------------------
// Comma Format
function CommaFormatted(amount) {
  var delimiter = ","; // replace comma if desired
  var a = amount.split('.',2)
  var d = a[1];
  var i = parseInt(a[0]);
  if(isNaN(i)) { return ''; }
  var minus = '';
  if(i < 0) { minus = '-'; }
  i = Math.abs(i);
  var n = new String(i);
  var a = [];
  while(n.length > 3) {
    var nn = n.substr(n.length-3);
    a.unshift(nn);
    n = n.substr(0,n.length-3);
  }
  if(n.length > 0) { a.unshift(n); }
  n = a.join(delimiter);
  if(d.length < 1) { amount = n; }
  else { amount = n + '.' + d; }
  amount = minus + amount;
  return amount;
}

function removeComma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
