import { LightningElement,track,wire } from 'lwc';
import {refreshApex} from '@salesforce/apex';
import getAlumni from '@salesforce/apex/GNController_LWC.getAlumni';
import saveAlumniLwc from '@salesforce/apex/GNController_LWC.saveAlumniLwc';
import getAlumniDetail from '@salesforce/apex/GNController_LWC.getAlumniDetail';
import deleteContacts from '@salesforce/apex/GNController_LWC.deleteContacts';
import updateAlumniLwc from '@salesforce/apex/GNController_LWC.updateAlumniLwc';
//import updateAlumniLwc from '@salesforce/apex/GNController_LWC.updateAlumniLwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class Alumni_List extends  NavigationMixin(LightningElement){
    @track columns = [
        { label: 'Name', fieldName: 'urlpath',type:'url',typeAttributes: {
            label: { fieldName: 'Name' },value:{fieldName: 'Name'}, target: 'urlpath'}},
        { label: 'Student', fieldName: 'StudentName',type:'url',sortable: true,typeAttributes: {
            label: {
                fieldName: 'StudentName'
            }}},
        { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date'},
        { label: 'End Date', fieldName: 'End_Date__c', type: 'date'} 
    ];
    @track myList =[{Name:"",Student__c:"",Start_Date__c:"",End_Date__c:""}]
    @track data ;
    @track valId;   
    @track detailValue =[{Name:"",Student__c:"",Start_Date__c:"",End_Date__c:""}];
    @track customFormModal = false; 
    @track showDetailPage = false;

   @track items;
   @track editFormModal=false;
   totalRecountCount=0;
   totalPage=0;
   endingRecord;
   pageSize=8;
   startingRecord;
   page=1;

    getAlumnies(){
        getAlumni()
    .then(data=>{
        if (data) {
            this.data = data.map( row => {
                return {...row,StudentName: row.Student__r.Name};
            })
            this.items = this.data;
            this.totalRecountCount = data.length; 
            console.log('Total Recount Count =',this.totalRecountCount);
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);      
            console.log('Total Page =',this.totalPage);    
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.error=undefined;
        } 
        else if (error) {
            this.error = error;
            this.data = undefined;
        }
    });
}
    connectedCallback() {
        refreshApex(this.getAlumnies());       
    }
// handel input of model 
    handleNameChange(event) {
        let element = this.myList.find(ele  => ele.Id === event.target.dataset.recordId);
        element.Name = event.target.value;
        this.myList = [...this.myList];
        console.log('Name Changed');
        console.log('Change val', JSON.stringify(this.myList));
    }
    handleSearchSelection(event){
        let element = this.myList.find(ele  => ele.Id === event.target.dataset.recordId);
        element.Student__c = event.target.value;
        this.myList = [...this.myList];
        console.log('Student  Changed');    
    }
    handleStartDateChange(event){
        let element = this.myList.find(ele  => ele.Id === event.target.dataset.recordId);
        element.Start_Date__c = event.target.value;
        // var firstdate=this.getFirstDateOfMonth(element.Start_Date__c);
        // event.target.value=firstdate;
        this.myList = [...this.myList];
        console.log('Start date Changed');
    }
    handleEndDateChange(event){
        let element = this.myList.find(ele  => ele.Id === event.target.dataset.recordId);
        element.End_Date__c = event.target.value;
        this.myList = [...this.myList];
        console.log('End date Changed');
    }
handleSave() {      
    console.log('DATA ->'+JSON.stringify(this.myList));
        saveAlumniLwc({records :   this.myList })
        .then((res) => {    
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Success',
                    message : `Records saved succesfully!`,
                    variant : 'success',
                }),
            )
            console.log('Response:',JSON.stringify(res));
            this.customHideModalPopup();
            this.error = undefined;
           let resId
            res.map(respo=>{
                resId = respo.Id;
            })
            this.valId = resId;
            this.showDetailPage=true;
            this.getAlumniDetails();     
        })
        .catch(error => {
            this.error = error;
            console.log("Error in Save call back:", this.error);
        });        
    }  
    handleBack(){
        this.showDetailPage=false;
        refreshApex(this.getAlumnies()); 
    }
    handleDelete(){
        deleteContacts({toDeleteId : this.valId})
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Success',
                    message : `Record deleted succesfully!`,
                    variant : 'success',
                }),
            )
            if(this.detailValue.length > 1) 
            this.detailValue.splice(indexPosition, 1);
            this.showDetailPage=false;
            refreshApex(this.getAlumnies()); 
            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
        })
    }
    getAlumniDetails(){
        getAlumniDetail({ids:this.valId})
        .then(data=>{
            if(data){
                let tempRecords = JSON.parse( JSON.stringify( data ) );
                tempRecords = tempRecords.map( row => {
                    console.log("row = - ",JSON.stringify(row));
                    return { ...row, Student__c: row.Student__r.Name };
                })
                this.detailValue = tempRecords;
                //this.myList = tempRecords;
                this.error = undefined;
                console.log("Detail - ",JSON.stringify(this.detailValue));
            } else if (error) {
                this.detailValue = undefined;
        //   throw new Error('Failed to retrieve session');
        }
      });
    }

//Method to show and hide modal
    customShowModalPopup() {            
        this.customFormModal = true;
    }
    customHideModalPopup() {            
        this.customFormModal = false;
    }
    handleCancel() {       
        this.getAlumnies();
    }
    handleFunction(event) {
        console.log('VAL ID ON CLICK Call IDDDDD = ',event.target.dataset.recordId);
        this.valId = event.target.dataset.recordId;
        this.showDetailPage=true;
        this.getAlumniDetails();  
    }
    handleUpdate(){
        console.log('My List Update = ',JSON.stringify(this.myList)); 
        var Name = "";
        var Start_Date__c = "";
        var End_Date__c = "";
        var Student__c = "";
        let toSaveList = this.myList;
        let toUpdate = this.detailValue;
        console.log('toSaveList Update = ',JSON.stringify(toSaveList)); 
        toSaveList.map((val)=>{
            if(val.Name != ""){
                Name = val.Name;
            }
            if(val.Student__c != ""){
                Student__c = val.Student__c;
            }
            if(val.Start_Date__c != ""){
                Start_Date__c = val.Start_Date__c;
            }
            if(val.End_Date__c != ""){
                End_Date__c = val.End_Date__c;
            }
            console.log('After toSaveList Update List = ', Name, Student__c, Start_Date__c, End_Date__c);
        });
        toUpdate.map(val=>{
            if(Name == ''){
                Name = val.Name;
            }
            if(Student__c == ''){
                Student__c = val.Student__c;
            }
           if(Start_Date__c == ''){
               Start_Date__c = val.Start_Date__c;
           }
           if(End_Date__c == ''){
               End_Date__c = val.End_Date__c;
           }
           console.log('After toUpdate Update List = ', Name, Student__c, Start_Date__c, End_Date__c);
            // console.log('After Update List = ',JSON.stringify(toSaveList));
        });  
        this.detailValue = toUpdate;
        this.detailValue.map(updateVal=>{
            updateVal.Name = Name;
            updateVal.Student__c = Student__c;
            updateVal.Start_Date__c = Start_Date__c;
            updateVal.End_Date__c = End_Date__c;
            updateVal.Student__r.Id = Student__c;
        });
        
        console.log('After detailValue Update List = ',JSON.stringify(this.detailValue));
      
        updateAlumniLwc({records : this.detailValue})
        .then((res) => {          
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Updated',
                    message : `Records Updated succesfully!`,
                    variant : 'success',
                }),
            )
            this.editHideModalPopup();
            this.error = undefined;
            let resId
             res.map(respo=>{
                 resId = respo.Id;
             })
             this.valId = resId;
             this.showDetailPage=true;
            this.getAlumniDetails();     
        })
        .catch(error => {
            this.error = error;
            console.log("Error in Save call back:", this.error);
        });        
    }
    handleEdit(){
        this.editFormModal=true;
    }
    editHideModalPopup() {            
        this.editFormModal = false;
    }
    // Pagination
    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //clicking on next button this method will be called
    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }
    
   //this method displays records page by page
    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);

        this.startingRecord = this.startingRecord + 1;
    }    
}