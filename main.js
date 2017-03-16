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

// Calculate
$('#inputs').on('input', function() {
  // // Define initial variables
  // var yourInvestment_VC = parseFloat($('input[name="angelInvestment"]').val());
  // var totInvestment_VC = parseFloat($('input[name="totInvestment_VC"]').val());
  // var postOptionPercent = parseFloat($('input[name="postOptionPercent"]').val());
  // var valuation = parseFloat($('input[name="valuation"]').val());
  // var fdPreShares = parseFloat($('input[name="fdPreShares"]').val());
  // var unallocOptionShares = parseFloat($('input[name="unallocOptionShares"]').val());

  // // Define note variables
  // var yourInvestment_note = parseFloat($('input[name="yourInvestment_note"]').val());
  // var totalInvestment_notevaluation = parseFloat($('input[name="totalInvestment_note"]').val());
  // var noteDiscount = parseFloat($('input[name="noteDiscount"]').val());
  // var noteCap = parseFloat($('input[name="noteCap"]').val());

  // // Compute Variables
  // var optionShares = 0;
  // var totNoteShares = 0;
  // var commonShares = (fdPreShares - unallocOptionShares);
  // var preValuation = (valuation - totInvestment_VC);
  // var postValuation = valuation;

  // var PPS_note = calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares); // PPS = price per share
  // var PPS_VC = calc_vcPPS(preValuation, fdPreShares, unallocOptionShares, optionShares, totNoteShares);

  // var vcShares = calc_vcShares(totInvestment_VC, PPS_VC);
  // var fdPostShares = commonShares + vcShares + totNoteShares + optionShares;
  // var commonPercent = calc_percentage(fdPostShares, commonShares);
  // var vcPercent = calc_percentage(fdPostShares, vcShares);
  // var totNotePercent = calc_percentage(fdPostShares, totNoteShares);
  // var optionPercent = calc_percentage(fdPostShares, optionShares);

  // Optimization
  optimize();

  // // Input Table
  // $('.preVal span').html(preValuation);
  // $('.postVal span').html(postValuation);
  // $('.fdPostShares span').html(fdPostShares);
  // $('.optionShares span').html(optionShares);
  // $('.sharePriceCom span').html(PPS_VC);
  
  // // Input sharesSituation
  // // Common Shares
  // $('.sharesSituation tr:nth-child(2) td:nth-child(2)').html(parseFloat(PPS_VC).toFixed(2));
  // $('.sharesSituation tr:nth-child(2) td:nth-child(3)').html(parseFloat(commonShares).toFixed(0));
  // $('.sharesSituation tr:nth-child(2) td:nth-child(4)').html(parseFloat(commonPercent).toFixed(0));

  // // Option Pool
  // $('.sharesSituation tr:nth-child(3) td:nth-child(2)').html(parseFloat('N/A').toFixed(0));
  // $('.sharesSituation tr:nth-child(3) td:nth-child(3)').html(parseFloat(optionShares).toFixed(0));
  // $('.sharesSituation tr:nth-child(3) td:nth-child(4)').html(parseFloat(optionPercent).toFixed(0));

  // // VC Shares
  // $('.sharesSituation tr:nth-child(4) td:nth-child(2)').html(parseFloat(PPS_VC).toFixed(2));
  // $('.sharesSituation tr:nth-child(4) td:nth-child(3)').html(parseFloat(vcShares).toFixed(0));
  // $('.sharesSituation tr:nth-child(4) td:nth-child(4)').html(parseFloat(vcPercent).toFixed(0));

  // // SAFE Shares
  // $('.sharesSituation tr:nth-child(5) td:nth-child(2)').html(parseFloat(PPS_note).toFixed(2));
  // $('.sharesSituation tr:nth-child(5) td:nth-child(3)').html(parseFloat(totNoteShares).toFixed(0));
  // $('.sharesSituation tr:nth-child(5) td:nth-child(4)').html(parseFloat(totNotePercent).toFixed(0));

});

/*****
angel_investment_note
total_note_investment
note_discount
note_cap

angel_investment_vc
vc_investment
optpool_target: option pool %
pre_valuation
post_valuation
fd_pre_shares
unallocated_pre_opt

total_note_shares
price_per_share
note_price_per_share
optpool_shares: number of option pool shares post financing
vcequity_target: VC equity ownership %
*****/

// Optimization Function
// Goal seeking method for calculating number of options we need to issue to in order to achieve our option pool and VC equity target

function calc_table() {
  // com_shares = calc_com_shares(ss.getRange(16, 2).getValue(), ss.getRange(17, 2).getValue());
  // ss.getRange(20, 5).setValue(com_shares);
  
  // price_per_share = calc_price_per_share(pre_valuation, fd_pre_shares, unallocated_pre_opt, ss.getRange(21, 5).getValue(), ss.getRange(23, 5).getValue());
  // note_price_per_share = calc_note_price_per_share(note_cap, fd_pre_shares, unallocated_pre_opt, ss.getRange(21, 5).getValue());
  // total_vc_shares = calc_vc_shares(vc_investment, price_per_share);
  // total_note_shares = calc_note_shares(total_note_investment, note_price_per_share);

  // ss.getRange(24, 2).setValue(price_per_share);
  // ss.getRange(23, 4).setValue(note_price_per_share);
  // ss.getRange(22, 5).setValue(total_vc_shares);
  // ss.getRange(23, 5).setValue(total_note_shares);
  commonShares = (fdPreShares - unallocOptionShares);
  preValuation = (valuation - totInvestment_VC);
  postValuation = valuation;

  PPS_note = calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares); // PPS = price per share
  PPS_VC = calc_vcPPS(preValuation, fdPreShares, unallocOptionShares, optionShares, totNoteShares);

  vcShares = calc_vcShares(totInvestment_VC, PPS_VC);
  fdPostShares = commonShares + vcShares + totNoteShares + optionShares;
  commonPercent = calc_percentage(fdPostShares, commonShares);
  vcPercent = calc_percentage(fdPostShares, vcShares);
  totNotePercent = calc_percentage(fdPostShares, totNoteShares);
  optionPercent = calc_percentage(fdPostShares, optionShares);
  
}

function optimize() {
  // Define initial variables
  var yourInvestment_VC = parseFloat($('input[name="angelInvestment"]').val());
  var totInvestment_VC = parseFloat($('input[name="totInvestment_VC"]').val());
  var postOptionPercent = parseFloat($('input[name="postOptionPercent"]').val());
  var valuation = parseFloat($('input[name="valuation"]').val());
  var fdPreShares = parseFloat($('input[name="fdPreShares"]').val());
  var unallocOptionShares = parseFloat($('input[name="unallocOptionShares"]').val());

  // Define note variables
  var yourInvestment_note = parseFloat($('input[name="yourInvestment_note"]').val());
  var totInvestment_note = parseFloat($('input[name="totalInvestment_note"]').val());
  var noteDiscount = parseFloat($('input[name="noteDiscount"]').val());
  var noteCap = parseFloat($('input[name="noteCap"]').val());

  // Compute Variables
  var optionShares = 0;
  var totNoteShares = 0;
  var commonShares = (fdPreShares - unallocOptionShares);
  var preValuation = (valuation - totInvestment_VC);
  var postValuation = valuation;

  var PPS_note = calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares); // PPS = price per share
  var PPS_VC = calc_vcPPS(preValuation, fdPreShares, unallocOptionShares, optionShares, totNoteShares);

  var vcShares = calc_vcShares(totInvestment_VC, PPS_VC);
  var fdPostShares = commonShares + vcShares + totNoteShares + optionShares;
  var totNoteShares = calc_noteShares(totInvestment_note, PPS_note);
  var commonPercent = calc_percentage(fdPostShares, commonShares);
  var vcPercent = calc_percentage(fdPostShares, vcShares);
  var totNotePercent = calc_percentage(fdPostShares, totNoteShares);
  var optionPercent = calc_percentage(fdPostShares, optionShares);
  // postOptionPercent = 0.05
  totaldiff = postOptionPercent - optionPercent; //0.05
  descentFactor = fdPreShares * 0.05
  var i = 0;
  var direction = 1;
  while (i<1000) {
    // calc_table();
    // Define initial variables
    yourInvestment_VC = parseFloat($('input[name="angelInvestment"]').val());
    totInvestment_VC = parseFloat($('input[name="totInvestment_VC"]').val());
    postOptionPercent = parseFloat($('input[name="postOptionPercent"]').val());
    valuation = parseFloat($('input[name="valuation"]').val());
    fdPreShares = parseFloat($('input[name="fdPreShares"]').val());
    unallocOptionShares = parseFloat($('input[name="unallocOptionShares"]').val());

    // Define note ables
    yourInvestment_note = parseFloat($('input[name="yourInvestment_note"]').val());
    totInvestment_note = parseFloat($('input[name="totalInvestment_note"]').val());
    noteDiscount = parseFloat($('input[name="noteDiscount"]').val());
    noteCap = parseFloat($('input[name="noteCap"]').val());

    // Compute ables
    commonShares = (fdPreShares - unallocOptionShares);
    preValuation = (valuation - totInvestment_VC);
    postValuation = valuation;

    PPS_note = calc_notePPS(noteCap, fdPreShares, unallocOptionShares, optionShares); // PPS = price per share
    PPS_VC = calc_vcPPS(preValuation, fdPreShares, unallocOptionShares, optionShares, totNoteShares);

    vcShares = calc_vcShares(totInvestment_VC, PPS_VC);
    fdPostShares = commonShares + vcShares + totNoteShares + optionShares;
    totNoteShares = calc_noteShares(totInvestment_note, PPS_note);
    commonPercent = calc_percentage(fdPostShares, commonShares);
    vcPercent = calc_percentage(fdPostShares, vcShares);
    totNotePercent = calc_percentage(fdPostShares, totNoteShares);
    optionPercent = calc_percentage(fdPostShares, optionShares);
    // ss.getRange(21, 5).setValue(optionShares);
    // optionPercent = ss.getRange(21, 6).getValue();
    newtotaldiff = Math.abs(postOptionPercent - optionPercent); //0.05
    if (newtotaldiff < 0.000001) {
      break;
    }
    optionShares = optionShares + descentFactor * direction;
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

}

function calc_com_shares(fd_pre_shares, unallocated_pre_opt) {
  return fd_pre_shares - unallocated_pre_opt;
}

function calc_vcShares(vc_investment, price_per_share) {
  return vc_investment / price_per_share;
}

function calc_noteShares(total_note_investment, note_price_per_share) {
  return total_note_investment / note_price_per_share;
}

function calc_percentage(fd_post_shares, shares) {
  return shares / fd_post_shares;
}

function calc_vcPPS(pre_valuation, fd_pre_shares, unallocated_pre_opt, optpool_shares, total_note_shares) {
  return pre_valuation / (fd_pre_shares - unallocated_pre_opt + optpool_shares + total_note_shares)
}

function calc_notePPS(note_cap, fd_pre_shares, unallocated_pre_opt, optpool_shares) {
  return note_cap / (fd_pre_shares - unallocated_pre_opt + optpool_shares)
}