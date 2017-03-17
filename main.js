// // Define Global Variables from calc_table
window.onload = function onload() {
  optionShares = 0;
  totNoteShares = 0; 
  commonShares = 0;
  vcShares = 0;

  console.log('helloooooooo world');
  console.log('initial optionShares: ' + optionShares);
  calc_table();
}


function calc_table() {
  yourInvestment_VC = parseFloat($('input[name="angelInvestment"]').val());
  totInvestment_VC = parseFloat($('input[name="totInvestment_VC"]').val());
  postOptionPercent = parseFloat($('input[name="postOptionPercent"]').val());
  valuation = parseFloat($('input[name="valuation"]').val());
  fdPreShares = parseFloat($('input[name="fdPreShares"]').val());
  unallocOptionShares = parseFloat($('input[name="unallocOptionShares"]').val());

  // Define note variables
  yourInvestment_note = parseFloat($('input[name="yourInvestment_note"]').val());
  totInvestment_note = parseFloat($('input[name="totalInvestment_note"]').val());
  noteDiscount = parseFloat($('input[name="noteDiscount"]').val());
  noteCap = parseFloat($('input[name="noteCap"]').val());

  // Compute Variables
  // this might be a problem with calculation down the line...
  commonShares = (fdPreShares - unallocOptionShares) || 0;
  preValuation = (valuation - totInvestment_VC);
  postValuation = valuation;

  PPS_note = calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares); // PPS = price per share
  PPS_VC = calc_vcPPS(preValuation, fdPreShares, unallocOptionShares, optionShares, totNoteShares);

  vcShares = calc_vcShares(totInvestment_VC, PPS_VC) || 0;
  fdPostShares = (commonShares + vcShares + totNoteShares + optionShares) || 0;
  totNoteShares = calc_noteShares(totInvestment_note, PPS_note) || 0;
  commonPercent = calc_percentage(fdPostShares, commonShares);
  vcPercent = calc_percentage(fdPostShares, vcShares);
  totNotePercent = calc_percentage(fdPostShares, totNoteShares);
  optionPercent = calc_percentage(fdPostShares, optionShares);
  yourShares_note = calc_yourShares_note(yourInvestment_note, PPS_note);
  yourSharesPercent_note = calc_percentage(fdPostShares, yourShares_note);
  // console.log('Common Shares: ' + commonShares)
  // console.log('FD Post Shares: ' + fdPostShares);
  // console.log('OptionShares: ' + optionShares);
  // console.log('OptionPercentage: ' + optionPercent);
}

// Calculate
$('#inputs').on('input', function() {
  // Calculation and Optimization
  optimize();

  // Update tables
  update_tables();
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
    console.log(optionPercent);
  };
}

function calc_com_shares(fd_pre_shares, unallocated_pre_opt) {
  return (fd_pre_shares - unallocated_pre_opt) || 0;
}

function calc_vcShares(vc_investment, price_per_share) {
  return (vc_investment / price_per_share) || 0;
}

function calc_noteShares(total_note_investment, note_price_per_share) {
  return (total_note_investment / note_price_per_share) || 0;
}

function calc_yourShares_note(yourInvestment_note, note_price_per_share) {
  return (yourInvestment_note / note_price_per_share) || 0;
}

function calc_percentage(fd_post_shares, shares) {
  return (shares / fd_post_shares) || 0;
}

function calc_vcPPS(pre_valuation, fd_pre_shares, unallocated_pre_opt, optpool_shares, total_note_shares) {
  return (pre_valuation / (fd_pre_shares - unallocated_pre_opt + optpool_shares + total_note_shares)) || 0
}

function calc_notePPS(note_cap, fd_pre_shares, unallocated_pre_opt, optpool_shares) {
  return (note_cap / (fd_pre_shares - unallocated_pre_opt + optpool_shares)) || 0
}

// Update Tables
function update_tables() {
  // Input Table
  $('.preVal span').html(preValuation);
  $('.postVal span').html(postValuation);
  $('.fdPostShares span').html(fdPostShares);
  $('.optionShares span').html(optionShares);
  $('.sharePriceCom span').html(PPS_VC);
  
  // Input sharesSituation
  // Common Shares
  $('.sharesSituation tr:nth-child(2) td:nth-child(2)').html(parseFloat(PPS_VC).toFixed(2));
  $('.sharesSituation tr:nth-child(2) td:nth-child(3)').html(parseFloat(commonShares).toFixed(0));
  $('.sharesSituation tr:nth-child(2) td:nth-child(4)').html(parseFloat(commonPercent).toFixed(4));

  // Option Pool
  $('.sharesSituation tr:nth-child(3) td:nth-child(2)').html(parseFloat('N/A').toFixed(0));
  $('.sharesSituation tr:nth-child(3) td:nth-child(3)').html(parseFloat(optionShares).toFixed(0));
  $('.sharesSituation tr:nth-child(3) td:nth-child(4)').html(parseFloat(optionPercent).toFixed(4));

  // VC Shares
  $('.sharesSituation tr:nth-child(4) td:nth-child(2)').html(parseFloat(PPS_VC).toFixed(2));
  $('.sharesSituation tr:nth-child(4) td:nth-child(3)').html(parseFloat(vcShares).toFixed(0));
  $('.sharesSituation tr:nth-child(4) td:nth-child(4)').html(parseFloat(vcPercent).toFixed(4));

  // SAFE Shares
  $('.sharesSituation tr:nth-child(5) td:nth-child(2)').html(parseFloat(PPS_note).toFixed(2));
  $('.sharesSituation tr:nth-child(5) td:nth-child(3)').html(parseFloat(totNoteShares).toFixed(0));
  $('.sharesSituation tr:nth-child(5) td:nth-child(4)').html(parseFloat(totNotePercent).toFixed(4));

  // Your SAFE Shares
  $('.sharesSituation tr:nth-child(6) td:nth-child(2)').html(parseFloat(PPS_note).toFixed(2));
  $('.sharesSituation tr:nth-child(6) td:nth-child(3)').html(parseFloat(yourShares_note).toFixed(0));
  $('.sharesSituation tr:nth-child(6) td:nth-child(4)').html(parseFloat(yourSharesPercent_note).toFixed(4));

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
