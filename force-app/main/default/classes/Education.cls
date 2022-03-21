public class Education {
 @AuraEnabled
    public static List<getdata> findByName(String searchKey) {
        System.debug('The value of searchKey is: '+ searchKey);
        if(searchKey==''||searchKey==' '||searchKey==null){
            return null;
        }
        else{
            List<getdata> responseList = new List<getdata>();                          
            
            List<List<SObject>> results1 = [FIND :searchKey IN ALL FIELDS  RETURNING Account(Name), Contact(Name), Opportunity(Name) ];
            for (List<SObject> sobjs1 : results1) {
                for (SObject sobj1 : sobjs1) {
                    getdata rw=new getdata();
                    rw.Id=sobj1.Id;
                    rw.ObjectName = ''+sobj1.getSObjectType();
                    //rw.fieldValue = sobj1.Name;
                    rw.fieldMap =new List<FieldClass>();
                    Map<String,Object> fieldMap = sobj1.getPopulatedFieldsAsMap();
                    for(String key : fieldMap.keySet()){
                        FieldClass fc = new FieldClass(key,STring.valueOf(fieldMap.get(key)));
                        rw.fieldMap.add(fc);
                        
                    }
                    responseList.add(rw);
                }
            }
            return responseList;
        }
    }
     Public class getdata{  
        @AuraEnabled
        public String Id;
        
        @AuraEnabled
        public String ObjectName;
        
        @AuraEnabled
        public List<FieldClass> fieldMap; 
        
    }
    
    public class FieldClass{
        @AuraEnabled
        public String fieldName;
        @AuraEnabled
        public String fieldValue;
        
        public FieldClass(String fieldName, STring fieldValue){
            this.fieldName = fieldName;
            this.fieldValue= fieldValue;
            
        } 
    }
}