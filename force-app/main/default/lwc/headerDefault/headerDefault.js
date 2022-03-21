import { LightningElement } from 'lwc';
	
import misti from '@salesforce/resourceUrl/misti';

export default class HeaderDefault extends LightningElement {
    misti = misti;
    check = false;
    hoverorders(){
        console.log('onhover!@@@@@@@');
    }
    spanClick(){
        console.log('spanClick@@@@@@@@@@@@@@@@');
    }
    hoverLeads(){
        if(!check ){
            check = true;
        }
        else{
            check = false;
        }
    }
}