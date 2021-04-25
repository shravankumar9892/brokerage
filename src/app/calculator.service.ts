import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  // Major indicators
  total_fees: number = 0.0 // return total fees
  trades: Array<DataModel> = []

  // Minor ones
  brokerage_fees: number = 0.0
  stamp_duty: number = 0.0
  sebi_turnover: number = 0.0
  stt: number = 0.0
  igst: number = 0.0
  exchange: number = 0.0
  
  // buffers
  n: number = 0
  current: number = 0.0
  trade_value: number = 0.0
  cost_per_trade: number = 0.0
  total_stocks: number = 0
  
  _: DataModel;
  constructor() { }
  
  addTrade(trade) {
    trade.cost_per_trade = 0.0 // cost per trade
    trade.shadow = false // making it visible on the dashboard
    trade.id = this.n + 1

    this.trades.push(trade)
    this.n = this.trades.length // updating the length of the global array

  	this.total_fees += this.setExtraCharges()
  	trade.net_profit = this.getNetProfit() // because getNetProfit needs updated total_fees

  	if (trade.types === 'SELL') {
  		this.total_stocks -= trade.qty
  	}
  	else {
  		this.total_stocks += trade.qty
  	}
  }

  deleteTrade(nth) {
    let trade = this.trades[nth-1] // get the cop of the trade
    this.trades.splice(nth-1, 1) // delete the trade
    
    // updating global values after trade deletion
    this.total_fees -= trade.cost_per_trade

    if (trade.types === 'SELL') {
      this.total_stocks += trade.qty
    }
    else {
      this.total_stocks -= trade.qty
    }

    // removing the minor ones
    let trade_value = trade.qty*trade.price

    this.brokerage_fees -= trade_value*0.0003
    this.exchange -= trade_value*0.0000325
    this.igst -= (trade_value*0.0003+trade_value*0.0000325)*0.18
    this.stamp_duty -= trade_value*0.00002
    this.sebi_turnover -= trade_value*0.0000015
    
    if (trade.types === 'SELL') {
      this.stt -= trade_value*0.00025
    }
  }

  makeShadow(nth) {
    this.trades[nth-1].shadow = !this.trades[nth-1].shadow

    let trade = this.trades[nth-1]
    let trade_value = trade.qty*trade.price 
    let brokerage_fees = trade_value*0.0003
    let exchange = trade_value*0.0000325
    let igst = (brokerage_fees + exchange)*0.18
    let stamp_duty = trade_value*0.00002
    let sebi_turnover = trade_value*0.0000015
    let stt = 0.0

    if (this.trades[nth-1].shadow === true) {

      // edits to the minor global values
      if (trade.types === 'SELL') {
        stt = trade_value*0.00025
        this.total_stocks += trade.qty
      }
      else {
        this.total_stocks -= trade.qty
      }

      this.brokerage_fees -= brokerage_fees
      this.exchange -= exchange
      this.igst -= igst
      this.stamp_duty -= stamp_duty
      this.sebi_turnover -= sebi_turnover
      this.stt -= stt

      // edits to the major ones
      this.total_fees -= trade.cost_per_trade
    }
    else { // unshadowing
      this.brokerage_fees += brokerage_fees
      this.exchange += exchange
      this.igst += igst
      this.stamp_duty += stamp_duty
      this.sebi_turnover += sebi_turnover

    if (trade.types === 'SELL') {
        stt = trade_value*0.00025
        this.total_stocks -= trade.qty
    }
    else {
      this.total_stocks += trade.qty
    }

    this.stt += stt
    this.total_fees += trade.cost_per_trade
  }
  }
  
  getNetProfit() { // Net profit for all the trades in the global pipeline
  let trade_value = 0.0
  	for (var val of this.trades) {
      if (val.shadow === false) {
        if (val.types === 'SELL') {
          trade_value = trade_value + val.qty*val.price
        }
        else {
          trade_value = trade_value - val.qty*val.price
        }
      }
  	}
  return trade_value - this.total_fees
  }
  
  getTotalStocks() {
  	let total_stocks = 0
    for (var val of this.trades) {
      if (val.shadow === false) {
        if (val.types === 'SELL') {
          total_stocks -= val.qty
        }
        else {
          total_stocks += val.qty
        }
      }
    }
    return total_stocks
  }
  
  setExtraCharges() {
  	let cost_per_trade = 0.0
    let current 
  	let n = this.n
  	let trade_value = this.trades[this.n-1].qty*this.trades[this.n-1].price
  	
  	// brokerage fees: 0.03%
  	current = trade_value*0.0003
  	this.brokerage_fees = this.brokerage_fees + current
  	cost_per_trade = cost_per_trade + current
  	
  	// exchange transaction fees: nse: 0.00325%
  	current = trade_value*0.0000325
  	this.exchange = this.exchange + current
  	cost_per_trade = cost_per_trade + current // 0.00325% in nse
  	
  	// IGST @ 18%
  	current = cost_per_trade*0.18
  	this.igst = this.igst + current
  	cost_per_trade = cost_per_trade + current
  	
  	// securities transaction tax: 0.025% on the sell side
  	if (this.trades[this.n-1].types === 'SELL') {
  		current = trade_value*0.00025
  		this.stt = this.stt + current
  		cost_per_trade = cost_per_trade + current
  	}
  	
  	// sebi turnover: 0.00015%
  	current = trade_value*0.0000015
  	this.sebi_turnover = this.sebi_turnover + current
  	cost_per_trade = cost_per_trade + current
  	
  	// stamp duty: 0.002%
  	current = trade_value*0.00002
  	this.stamp_duty = this.stamp_duty + current
  	cost_per_trade = cost_per_trade + current
  	
  	this.trades[this.n-1].cost_per_trade = cost_per_trade
    // this.trades[this.n-1].net_profit = this.getNetProfit()
  	return cost_per_trade
  } 

  // ###################################################################

  // Getters
  getTrades() { return this.trades }
  
  getExtraCharges() { return this.total_fees }
  
  getExchange() { return this.exchange }
  
  getIGST() { return this.igst }
  
  getSTT() { return this.stt }
  
  getSEBI() { return this.sebi_turnover }
  
  getStamp() { return this.stamp_duty }
  
  getBrokerage() { return this.brokerage_fees }

  // ###################################################################
  
  // Functions used for giving estimates
  // are called quite often
  getTestExtraCharges(trade) {
    
    let extra_charges = 0.0
    let trade_value = trade.qty*trade.price
    
    extra_charges += trade_value*0.0003 // brokerage fees: 0.03%
    extra_charges += trade_value*0.0000325 // exchange transaction fees: nse: 0.00325%
    extra_charges += extra_charges*0.18 // IGST @ 18%
    
    if (trade.types === 'SELL') {
      extra_charges += trade_value*0.00025 // securities transaction tax: 0.025% on the sell side
    }
    
    extra_charges += trade_value*0.0000015 // sebi turnover: 0.00015%
    extra_charges += trade_value*0.00002 // stamp duty: 0.002%
    
    return extra_charges
  }
  
  getTestTotalProfit(trade) {
    let net = this.getNetProfit()
    let trade_value = trade.qty*trade.price
    
    if (trade.types === 'SELL') {
      net += trade_value
    }
    else {
      net -= trade_value
    }
    return net - this.getTestExtraCharges(trade)
  }
}

export interface DataModel {
  id: number,
	qty: number,
	price: number,
	types: string,
	real: boolean,
	cost_per_trade: number,
  net_profit: number,
  shadow: boolean
}
