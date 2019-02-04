({
    isValidComponent: function (component) {
        return component.isValid()
            && component.get('v.baseComponentScriptsLoaded') === true
            && component.get('v.scriptsLoaded') === true;
    },

    // Array mutation helpers
    removeAtIndex: function (array, index) {
        if (index > -1) {
           array.splice(index, 1);
        }
    },
    
    insertAtIndex: function (array, index, elems) {
        if (index > -1 && this.isNotEmpty(elems)) {
           array.splice(index, 0, elems);
        }
    },

    // Toast factory
    toast: function () {
        const toastEvent = $A.get("e.force:showToast");   
        const displayToast = (title = '', message = '', duration = 3000, type = 'info') => {
            toastEvent.setParams({
                "title": title,
                "message": message,
                "type": type,
                "duration": duration
            });
            toastEvent.fire();
        }
    
    	const success = (title, message, duration) => displayToast(title, message, duration, "success");
        const error = (title, message, duration) => displayToast(title, message, duration, "error");
        const warning = (title, message, duration) => displayToast(title, message, duration, "warning");
        const info = (title, message, duration) => displayToast(title, message, duration, "info");

        return {
            success: success,
            error: error,
            warning: warning,
            info: info
        }
    },
    
	fireComponentEvent : function(component, typeName, payload) {
		const compEvent = component.getEvent("ComponentEvent");
		compEvent.setParams({
			"type": typeName,
			"payload": payload
		});
		compEvent.fire();
  	},
    
    refreshView: function () {
        $A.get('e.force:refreshView').fire();
    }

	executeAction: function (action) {
        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                const state = response.getState();
                if (state === "SUCCESS") {
                    const retVal = response.getReturnValue();
                    try {
                        resolve(JSON.parse(retVal));
                    } catch (e) {
                    	resolve(retVal);
                    }
                } else if (state === "ERROR") {
                    const errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    }
                    else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },


    // implementation of debounce since lodash' debounce doesnt work in lightning
    debounce: function (fn, delayInMs) {
        const delay = !delayInMs ? 0 : delayInMs;
        const timeoutId = fn.toString(); // generating a unique string by strinifying the function
        return (...args) => {
            clearTimeout(window[timeoutId]);
            window[timeoutId] = setTimeout($A.getCallback(() => fn.apply(this, args)), delay);
        };
    },   

    // implementation of delay since lodash' delay doesnt work in lightning
    delay: function (duration) {
        return new Promise(function(resolve) {
            window.setTimeout($A.getCallback(resolve), duration);   
        });           
    },

	createComponent : function(name, params) {
		return new Promise(function(resolve, reject) {
			$A.createComponent(name, params, function(createdComponent, status, erorrMessage) {
				if (status === "SUCCESS") {
					resolve(createdComponent);
				} else if (status === "ERROR") {
					reject(Error("Error message: " + erorrMessage));
				} else if (status === "INCOMPLETE") {
					reject(Error("No response from server or client is offline."));
				}
			});
		});
    }, 
    
    // navigation helpers
    getURL : function(component) {
        const navService = component.getSuper().find("navService");
        return navService.generateUrl;
    },

    getNavService: function (component) {
        return component.getSuper().find("navService");
    },

    getWorkspaceApi: function (component) {
        return component.getSuper().find("workspace");
    },
                
    navigate : function(component, pageReference, replace) {
        const navService = component.getSuper().find("navService");
        navService.navigate(pageReference, replace);
    }, 
                

	navigateToSObjectHome : function(component, sObjectName) {
        const pageReference = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: sObjectName,
                actionName: 'home'
            }
        };

        this.navigate(component, pageReference);
    },
                
    openCreateSObjectRecordModal : function(component, sObjectName) {
        const pageReference = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: sObjectName,
                actionName: 'home'
            }
        };

        this.navigate(component, pageReference);
    },
                
    openEditSObjectRecordModal : function(component, sObjectId, sObjectName) {
        const pageReference = {
            type: 'standard__recordPage',
            attributes: {
                recordId : sObjectId,
                objectApiName: sObjectName,
                actionName: 'edit'
            }
        };

        this.navigate(component, pageReference);
    },
                
    navigateToSObjectRecord : function(component, sObjectId, sObjectName) {
        const pageReference = {
            type: 'standard__recordPage',
            attributes: {
                recordId : sObjectId,
                objectApiName: sObjectName,
                actionName: 'view'
            }
        };

        this.navigate(component, pageReference);
    },
                
    navigateToComponent : function(component, componentName, params) {
        const pageReference = {
            type: 'standard__component ',
            attributes: {
                objectApiName: 'c__' + componentName,
            },
            state: params
        };
        
 		this.navigate(component, pageReference);
    },                
                
	navigateBack: function () {
		window.history.back();
		return false;
	}
})