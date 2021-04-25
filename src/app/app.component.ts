import { Component } from '@angular/core';
import { FormModel } from './models';
import { NgForm } from '@angular/forms';
import { CalculatorService, DataModel } from './calculator.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'brokerage-calculator'

  total_fees: number = 0.0
  _types: Array<string> = ['BUY', 'SELL']
  real = [true, false]
  model = new FormModel(1, 1440.38, this._types[0])
  submitted = false
  trades: Array<DataModel> = []
  
  // Minor ones
  brokerage_fees: number = 0.0
  stamp_duty: number = 0.0
  sebi_turnover: number = 0.0
  stt: number = 0.0
  igst: number = 0.0
  exchange: number = 0.0
  net_profit: number = 0.0
  total_stocks: number = 0
  
  // for tests
  rough: number = 0.0
  
  constructor(private calculator: CalculatorService) {}
  
  // // Functions directly used from the template
  onSubmit(tradeForm: NgForm) { 
  	this.calculator.addTrade(tradeForm.value)
  	this.total_fees = this.calculator.getExtraCharges()
  	this.trades = this.calculator.getTrades()
    this.updateGlobalValues() // Updating other global values affected by adding new trade
    // this.trades[this.trades.length-1].net_profit = this.net_profit
  }

  updateGlobalValues() {
    // Updating other global values affected by deleting
    this.total_fees = this.calculator.getExtraCharges()
    this.trades = this.calculator.getTrades()
    
    this.brokerage_fees = this.calculator.getBrokerage()
    this.stamp_duty = this.calculator.getStamp()
    this.sebi_turnover = this.calculator.getSEBI()
    this.stt = this.calculator.getSTT()
    this.igst = this.calculator.getIGST()
    this.exchange = this.calculator.getExchange()
    this.total_stocks = this.calculator.getTotalStocks()
    this.net_profit = this.calculator.getNetProfit()
  }
  
  getExtraCharges() {
  	return this.calculator.getTestExtraCharges(this.model)
  }
  
  getTotalProfit() {
  	return this.calculator.getTestTotalProfit(this.model)
  }

  deleteTrade(nth) { // nth element id
    this.calculator.deleteTrade(nth)
    this.updateGlobalValues() // Updating other global values affected by deleting
  }

  shadowTrade(nth) {
    this.calculator.makeShadow(nth)
    this.updateGlobalValues() // Updating other global values affected by shadowing
  }

}
