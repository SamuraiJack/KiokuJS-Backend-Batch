StartTest(function(t) {
    
    var async0 = t.beginAsync()
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')
    
    t.ok(KiokuJS.Test, "KiokuJS.Test is here")
    t.ok(KiokuJS.Backend.CouchDB, "KiokuJS.Backend.CouchDB is here")
    t.ok(KiokuJS.Backend.Batch, "KiokuJS.Backend.Batch is here")

    
    t.harness.currentPort   = t.harness.currentPort || 9000
    
    new KiokuJS.Test({
        t       : t,
        
//        fixtures    : [ 'StressLoad.Tree' ],
//        fixtures    : [ 'ObjectGraph' ],
        
        connect : function () {
            
            var dbURL   = 'http://local/5984/kiokujs-backend-couchdb-' + new Date().getTime()
            var port    = t.harness.currentPort++
            
            HTTP.Request.Provider.getRequest({ 
                
                headers : { 'content-type' : 'application/json' },
                
                url     : '/8080/start_test', 
                method  : 'PUT',
                
                data    : JSON2.stringify({ 
                    port            : port,
                    
//                    deepPrefetch    : true,
                    
                    backendClass    : 'KiokuJS.Backend.CouchDB',
                    backendParams   : {
                        dbURL   : dbURL
                    }
                })
                
            }).andThen(function () {
                
                var backend = new KiokuJS.Backend.CouchDB({
                    trait       : KiokuJS.Backend.Batch,
                    
                    baseURL     : 'http://local/' + port,
                    dbURL       : dbURL
                })
                
                backend.__port__ = port
                
                backend.__createDB().andThen(function () {
                    
                    this.CONTINUE(backend)
                })
            })
        },
        
        cleanup : function (backend, t) {
            
            HTTP.Request.Provider.getRequest({ 
                
                headers : { 'content-type' : 'application/json' },
                
                url     : '/8080/finish_test', 
                method  : 'PUT',
                
                data    : JSON2.stringify({ 
                    port : backend.__port__ 
                })
                
            }).andThen(function () {
                
                backend.__deleteDB().now()
            })
        }
        
    }).runAllFixtures().andThen(function () {
        
        t.endAsync(async0)
        
        t.done()
    })
})    
