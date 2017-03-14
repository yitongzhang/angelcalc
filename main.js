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
  // Call function

  var amount = parseFloat($('#inputs .noteAmount input').val());
  var i = parseFloat($('#inputs .noteInterest input').val());
  var discount = parseFloat($('#inputs .noteDiscount input').val());
  var cap = parseFloat($('#inputs .noteCap input').val());  
  var dur = parseFloat($('#inputs .durationToConvert input').val());
  var val = parseFloat($('#inputs .pricedValuation input').val());
  var result = amount*Math.pow((1+(i/100)),(dur/12))/(Math.min(cap, val)*(1-(discount/100)))*100;
  // Compute Final Result
  $('#result .resultFinal').html(parseFloat(result).toFixed(2)+"%");
  
  // Compute Details
  var debtAmount = amount*Math.pow((1+(i/100)),(dur/12));
  var finalValuation = Math.min(cap, val)*(1-(discount/100));
  $('#result .result-details table tr:nth-child(2) td:nth-child(2)').html(parseFloat(debtAmount).toFixed(0));
  $('#result .result-details table tr:nth-child(3) td:nth-child(2)').html(parseFloat(finalValuation).toFixed(0));
  
  // Sensitivity Analysis
  for (var j = 0; j < 5; j++) {
    // Duration Header
    $('#result .result-sensitivity table tr:nth-child(1) td:nth-child('+(j+2)+')').html(parseFloat(dur+3*(j-1)).toFixed(0)); 
  }

  // Valuation Sensitivity
  var valSens = parseFloat(val)*0.5;
  var resultSens = 0;
  for (var k = 0; k < 5; k++) {
    $('#result .result-sensitivity table tr:nth-child('+(k+3)+') td:nth-child(1)').html(parseFloat(val+valSens*(k-1)).toFixed(0));
    for (var l = 0; l < 5; l++) {
      resultSens = amount*Math.pow((1+(i/100)),((dur+3*(l-1))/12))/(Math.min(cap, val+valSens*(k-1))*(1-(discount/100)))*100;
      $('#result .result-sensitivity table tr:nth-child('+(k+3)+') td:nth-child('+(l+2)+')').html(parseFloat(resultSens).toFixed(2)+'%');       
    }
  }
  
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
  com_shares = calc_com_shares(ss.getRange(16, 2).getValue(), ss.getRange(17, 2).getValue());
  ss.getRange(20, 5).setValue(com_shares);
  
  price_per_share = calc_price_per_share(pre_valuation, fd_pre_shares, unallocated_pre_opt, ss.getRange(21, 5).getValue(), ss.getRange(23, 5).getValue());
  note_price_per_share = calc_note_price_per_share(note_cap, fd_pre_shares, unallocated_pre_opt, ss.getRange(21, 5).getValue());
  total_vc_shares = calc_vc_shares(vc_investment, price_per_share);
  total_note_shares = calc_note_shares(total_note_investment, note_price_per_share);

  ss.getRange(24, 2).setValue(price_per_share);
  ss.getRange(23, 4).setValue(note_price_per_share);
  ss.getRange(22, 5).setValue(total_vc_shares);
  ss.getRange(23, 5).setValue(total_note_shares);
  
}

function optimize(optpool_shares, optpool_target, vcequity_target) {
  pre_money_shares = 5000000
  optpool_shares = 0
  optpool_target = 0.05
  optpool_percentage = ss.getRange(21, 6).getValue();
//  Logger.log(optpool_percentage);
  totaldiff = optpool_target - optpool_percentage; //0.05
//  Logger.log(totaldiff)
  descentFactor = 5000000 * 0.05
  var i = 0;
  var direction = 1;
  while (true) {
    calc_table();
    ss.getRange(21, 5).setValue(optpool_shares);
    optpool_percentage = ss.getRange(21, 6).getValue();
    newtotaldiff = Math.abs(optpool_target - optpool_percentage); //0.05
    // Logger.log("diff now:" + newtotaldiff);
    // Logger.log("optpool %:" + optpool_percentage); //0.05
    if (newtotaldiff < 0.000001) {
      break;
    }
    optpool_shares = optpool_shares + descentFactor * direction;
    Logger.log(optpool_shares);
    if (optpool_percentage >= optpool_target) {
      currentdir = -1; // decrease
    } else {
      currentdir = 1; // increase
    }
    Logger.log("current direction: " + currentdir);
    Logger.log("old direction" + direction);
    if (currentdir == direction) {
      Logger.log("continue");
    } else {
      descentFactor = Math.max(descentFactor / 2, 1);
      direction = direction * -1;
      Logger.log("descent factor" + descentFactor);
    }
    i++;
    Logger.log("direction for next group:" + direction);
    Logger.log("-----------------");
  };
}

function calc_com_shares(fd_pre_shares, unallocated_pre_opt) {
  return fd_pre_shares - unallocated_pre_opt;
}

function calc_vc_shares(vc_investment, price_per_share) {
  return vc_investment / price_per_share;
}

function calc_note_shares(total_note_investment, note_price_per_share) {
  return total_note_investment / note_price_per_share;
}

function calc_ownership_per(fd_post_shares, shares) {
  return shares / fd_post_shares;
}

function calc_price_per_share(pre_valuation, fd_pre_shares, unallocated_pre_opt, optpool_shares, total_note_shares) {
  return pre_valuation / (fd_pre_shares - unallocated_pre_opt + optpool_shares + total_note_shares)
}

function calc_note_price_per_share(note_cap, fd_pre_shares, unallocated_pre_opt, optpool_shares) {
  return note_cap / (fd_pre_shares - unallocated_pre_opt + optpool_shares)
}