var Net = (function(){
  var handleError = function(messages) {
    var message = ""
    messages.forEach(function(msg){
      message = "\t" + msg + "\n"
    })
    alert('Whoops: encountered an error\n\n' + message)
 }
 return {
   fail:function(deferred) {
    var self = this
    return deferred.fail(function(response) {
      if (response.status < 400 || response.status > 500 || response.responseJSON == undefined) {
        return 
      } 
      var json = response.responseJSON
      var messages = json.messages 
      if (messages == undefined) {
        messages = [json.message]
      }
      var error = self.handleError || handleError
      error(messages)
      self.handleError = undefined
    })
   },
   get:function(url) {
    return this.fail($.getJSON(url))
   },

   post:function(url, data) {
    return this.fail(
      $.ajax({
        url:url,
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data:JSON.stringify({data: data})
      })
    )
   },

   put: function(url, data) {
    return this.fail($.ajax({
      url: url,
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({data: data}),
      dataType:'json'
    }))
   }

 }
})()
var Api = (function(Net){
  var API_URL = window.location.origin 
  var ENDPOINT="/companies"
  var url = function(param="") {
    var _param = param.length ? "/" + param : ""
    return API_URL + ENDPOINT + param;
  }
  return {
    getCompanies: function() {
      return Net.get(url())
    },

    getCompany: function(id) {
      return Net.get(url(id))
    },

    updateCompany: function(company) {
      return Net.put(url(), company)
    },
    createCompany: function(company) {
      return Net.post(url(), company)
    }
  }   
})(Net)

var CompanyBox = React.createClass({
  getInitialState: function() {
    return {companies: []};
  },
  newCompany: function(company) {
    var companies = this.state.companies 
    this.state.companies  = [company, ...companies] 
    this.forceUpdate()
  },
  componentDidMount: function() {
    Api.getCompanies().done((response) => {
      if (response.success) {
        this.setState({companies:response.data})
      }
    })
  },
  render: function() {
    return (
      <div className="companyBox">
        <h1 className="text-center m-b-lg">Companies</h1>
        <CompanyNewForm newCompany={this.newCompany}/>
        <CompanyList companies={this.state.companies} />
      </div>
    );
  }
});

var AddCompany = React.createClass({
  handleClick: function(event) {
    event.preventDefault();
    this.props.showNewForm();
    return false
  },
  render: function() {
    console.log('show success', this.props.showSuccess)
    return (
      <div className="row m-b-lg">
      {this.props.showSuccess ? <AlertSuccess successMessage="Nice, company was successfully created!"/> : null }
      <a href="#" className="pull-right" onClick={this.handleClick}>Add a Company</a>
      </div>
    );  
  }
});

var ErrorStatus = React.createClass({
  render: function() {
    var errors = this.props.errors.map((error) => {
      return <li>{error}</li>
    })
    return (
      <div className="message card-block">
        <div className="alert alert-danger" role="alert">
          <p>Woops! Server responded with the following errors:</p> 
          <ol className="p-l-lg m-t">{errors}</ol>
        </div>
      </div>
    )
  }
}) 

var DeleteBeneficiary = React.createClass({
  handleClick: function(event) {
    event.preventDefault();
    this.props.onDelete();
    return false
  },
  render: function() {
    return (
      <a href="#" className="pull-right" onClick={this.handleClick}>Delete</a>
    );  
  }
});

var BeneficiaryInput = React.createClass({
  onDelete: function() {
    this.props.deleteBeneficiary(this.props.index)
  },
  onChange: function(event) {
    this.props.updateBeneficiary(this.props.index, event.target.value)
  },
  render: function() {
    var formGroup = "form-group required col-sm-12" 
    var inputClass = "col-sm-9"
    var helpBlock 
    var hasError =  this.props.hasError
    if (hasError) {
      formGroup = formGroup + " has-error"
      inputClass = inputClass + " form-control-error"
      helpBlock = <div className="help-block col-sm-9">This field is required.</div>
    }
    return (
      <div className="row">
       <div className={formGroup}>
        <div className="control-label">
        <input type="text" onChange={this.onChange} defaultValue={this.props.name} className={inputClass} placeholder="Name" />
        </div>
        <DeleteBeneficiary onDelete={this.onDelete}/>
        {helpBlock}
      </div></div>

    )
  }
}) 

var AddBeneficiary = React.createClass({
  handleClick: function(event) {
    event.preventDefault()
    this.props.addBeneficiary();
    return false
  },
  render: function() {
    return (
      <div className="col-sm-9 m-b">
      <a href="#" className="pull-right" onClick={this.handleClick}>Add Beneficiary</a>
      </div>
    );  
  }
});

var FormInput = React.createClass({
  getInitialState: function() {
    return {invalid:false, value:this.props.value};
  },
  validate: function() {
    if (this.props.required) { 
     if (this.state.value.length == 0) {
        this.setState({invalid:true})
      } else {
        this.setState({invalid:false})
      }
    }   
  },
  onChange: function(event) {
    var value = event.target.value
    this.props.onChange(this.props.property, value);
    this.state.value = value
    this.validate()
  },
  componentWillReceiveProps: function(props) {
    this.state.invalid = props.hasError
  },
  render: function() {
    var className = "form-group row" 
    var inputClass = "col-sm-9 " + this.props.placeholder.toLowerCase()
    var helpBlock 
    var hasError = this.state.invalid 
    if (hasError) {
      className = className + " has-error"
      inputClass = inputClass + " form-control-error"
    }
    if (this.props.required == true) {
      className = className + " required"
      if (hasError) {
        helpBlock = <div className="help-block col-sm-9">This field is required.</div>
      }
    } 
    return (
      <div className={className}>
        <div className="control-label">
        <input defaultValue={this.state.value} type={this.props.type} onChange={this.onChange} className={inputClass} placeholder={this.props.placeholder} />
        {helpBlock}
       </div> 
      </div>
    );  
  }
});

var BeneficiariesForm = React.createClass({
  getInitialState: function() {
    return {beneficiaries:this.props.beneficiaries};
  },
  addBeneficiary: function() {
    var beneficiaries = this.state.beneficiaries
    beneficiaries.push({name:""})
    this.props.updateBeneficiaries(beneficiaries)
    this.setState({beneficiaries:beneficiaries})
  },
  updateBeneficiary: function(target, value) {
    var beneficiary = this.state.beneficiaries[target]
    beneficiary.name = value
    console.log('update bene', target, beneficiary)
    this.props.updateBeneficiary(target, beneficiary)
  },
  deleteBeneficiary: function(target) {
    var beneficiaries = this.state.beneficiaries
    beneficiaries = beneficiaries.filter(function(_, index) {
        return index !== target
    })
    this.props.updateBeneficiaries(beneficiaries)
    this.setState({beneficiaries:beneficiaries})
  },
  render: function() {

    var beneficiaryNodes = this.state.beneficiaries.map((beneficiary, index) => {
      var key = (beneficiary.id ||"")+ index
      return <BeneficiaryInput updateBeneficiary={this.updateBeneficiary} name={beneficiary.name} index={index} key={key} deleteBeneficiary={this.deleteBeneficiary}/>
    });
    return (
      <div className="beneficiaries">
        <AddBeneficiary addBeneficiary={this.addBeneficiary}/>
        {beneficiaryNodes}
      </div>
    )
  }
}) 

var Input = function(placeholder, options={}) {
  var type = options.type || "text" 
  var property = options.property || placeholder.toLowerCase()
  var required = options.required == undefined ? true : options.required
  return {placeholder:placeholder, required:required, property:property, type:type}
}
var CompanyModel = {
  id:"",
  name:"",
  address:"",
  city:"",
  country:"",
  email:"",
  phone:"",
  beneficiaries:[]
}
var RequiredFields = "id name address city country" 
var RequiredFieldsSplit = RequiredFields.split(' ')

var isRequiredField = function() {
  return RequiredFields.indexOf(field) !== -1
}
var submitCompanyForm = function(company) {
  this.state.submitted = true 
  Net.handleError = (messages) => {
    var state = this.state 
    state.submit.errors = messages
    this.setState(state)
  }
  if (this.state.editMode) {
    Api.updateCompany(company).done((response)=> {
      this.props.editDone(company)
    })
  } else {
    Api.createCompany(company).done((response)=> {
      this.props.onSuccess(company)
    })
  }
}
var CancelAction = React.createClass({
  handleClick: function() {
    this.props.onCancel()
  },
  render: function() {
    return (
      <a href="#"  onClick={this.handleClick}>Cancel</a>
    );  
  }
});

var CompanyForm = React.createClass({
  getInitialState: function() {
    return { submitted:false, editMode:!!this.props.editMode, beneficiaryErrors:[], submit:{success:false, errors:[]}, company:this.props.company, errors:{}};
  },
  updateBeneficiaries: function(beneficiaries) {
    this.state.company.beneficiaries = beneficiaries
    console.log('updated!!!', beneficiaries, this.state.company.beneficiaries)
    var state = this.state
    if (beneficiaries.length == 0) {
      state.beneficiaryRequired = true
      this.setState(state)
    } else if (this.state.beneficiaryRequired) {
      state.beneficiaryRequired = false
      this.setState(state)
    }
  },
  updateBeneficiary: function(target, value) {
    console.log('value', value)
    this.state.company.beneficiaries[target] = value
  },
  updateCompany: function(property, value) {
    this.state.company[property] = value;
  }, 
  handleSubmit: function(event) {
    event.preventDefault()
    var state = this.state
    var errors = state.errors = {}
    state.beneficiaryErrors = []
    RequiredFieldsSplit.forEach((field) => {
      if (state.company[field].length == 0) {
        errors[field]=true
      }
    }) 
    var beneficiaryErrors = []
    state.company.beneficiaries.forEach((beneficiary, index) => {
      if (beneficiary.name.length == 0) {
        beneficiaryErrors.push(index)
      }
    }) 
    var inputErrorsLength = Object.keys(errors).length  
    if (inputErrorsLength > 0) {
      state.errors = errors
    } 
    if (beneficiaryErrors.length > 0) {
      state.beneficiaryErrors = beneficiaryErrors
    } 
    var beneficiaries = state.company.beneficiaries
    if (beneficiaries.length == 0) {
        state.beneficiaryRequired=true
     }   
    if ((inputErrorsLength + beneficiaryErrors.length) > 0 || state.beneficiaryRequired) {
      this.setState(state)
    } else {
      submitCompanyForm.call(this, state.company)
    }
    return false 
  },
  render: function() {
     var inputs = [
      Input("Id"),
      Input("Name"),
      Input("Address"),
      Input("City"),
      Input("Country"),
      Input("Email", {required:false}),
      Input("Phone", {required:false})
    ]
    var inputNodes = inputs.map((input, index) => {
      var hasError = !!this.state.errors[input.property]
      return <FormInput onChange={this.updateCompany} hasError={hasError} value={this.state.company[input.property]} required={input.required} property={input.property} placeholder={input.placeholder} key={index} type={input.type}/>
    });
    return (
       <div className="card companyForm row">
        <div className="card-header">
          <h3 className="card-title">
          {this.state.editMode ? "Edit Company" : "New Company"}
          </h3>
        </div> 
        {!!this.state.submitted && !this.state.submit.success && <ErrorStatus errors={this.state.submit.errors}/>}
      <form onSubmit={this.handleSubmit}> 
       <div className="card-block">
          {inputNodes}
          <div className="row">
            <dl>
              <dt className="col-sm-9 m-b">
                <span className="input-required">Beneficiaries:</span>
               { this.state.beneficiaryRequired ?  <span className="text-danger pull-right">A least one beneficiary is required.</span> : null } 
              </dt>
              <dd><BeneficiariesForm updateBeneficiary={this.updateBeneficiary} beneficiaries={this.state.company.beneficiaries} updateBeneficiaries={this.updateBeneficiaries}/></dd>
              </dl>
          </div>
      </div>    
      <div className="card-footer">
        <div className="row">
         <div className="col-sm-2"><CancelAction onCancel={this.props.onCancel}/></div> 
         <div className="col-sm-2"><input type="submit"  value={ this.state.editMode ? "Update" : "Submit"} /></div>
        <div className="text-info text-center col-sm-8"><small className="text-muted">
            Fields marked with <span className="text-danger"><strong> * </strong></span>
            are required.
          </small>
          </div>
           
         </div>
      </div>
       </form> 
      </div>
    );  
  }
});

var AlertSuccess = React.createClass({
  getInitialState: function(){
    return { faded: false };
  },
  fadeOut: function() {
    this.setState({faded:true})
    clearInterval(this.timer);
  }, 
  componentDidMount: function(){
    this.timer = setTimeout(this.fadeOut, 2500);
  },
  componentWillUnmount: function(){
    clearTimeout(this.timer);
  },
  render: function() {
   if (this.state.faded) {
    return null
   } else {
    return <div className="alert alert-success" role="alert">{this.props.successMessage}</div>
    }
  }
});

var CompanyNewForm = React.createClass({
  getInitialState: function() {
    return { visible: false, success:false};
  },
  onSuccess: function(company) {
    this.setState({success:true, visible:false})
    this.props.newCompany(company)
  },
  onCancel: function() {
    this.setState({visible:false})
  },
  showNewForm: function() {
    this.setState({visible:true})
  },
  render: function() {
    if (this.state.visible) {
      return <CompanyForm onSuccess={this.onSuccess} company={Object.assign({},CompanyModel)} onCancel={this.onCancel}/>
    } else {
      return (
        <AddCompany showSuccess={this.state.success} showNewForm={this.showNewForm}/>
      )  
    }
  }
});


var CompanyEdit = React.createClass({
  render: function() {
    return (
      <CompanyForm onCancel={this.props.editCancel}  editMode={true} company={this.props.company} editDone={this.props.editDone}/>
    );
  }
});
var CompanyShow = React.createClass({
  render: function() {
     var company = this.props.company
     return (
      <div className="company card">
        {this.props.editSuccess ? <AlertSuccess successMessage="Sweet, company was successfully updated!"/> : null}
        <div className="card-header bg-info">
         <EditAction onEdit={this.props.showEdit}/>
         <h2>Name: {company.name}</h2>
         </div>
        <div className="card-block">
          <dl>
            <dt> Address: </dt>
            <dd>
              <address>
                {company.address}<br/>
                {company.city}, {company.country}<br/>
                { !!company.email && company.email}
                { !!company.email && <br/>}
                 { !!company.phone && company.phone }
                {!!company.phone && <br/>}
              </address>
            </dd>
            <dt>Beneficiaries:</dt>
            <dd>
             <Beneficiaries beneficiaries={company.beneficiaries}/>
            </dd>
          </dl>
        </div> 
        <div className="card-footer">
          ID: {company.id}
        </div>
      </div>
    );
  }
});

var EditAction = React.createClass({
  handleClick:function(event) {
    event.preventDefault();
    this.props.onEdit();
    return false
  },
  render: function() {
    return (
     <a href="#" className="pull-right edit-action" onClick={this.handleClick} ><strong>Edit</strong></a>  
    );
  }
});
var Company = React.createClass({
  getInitialState: function() {
    return { edit: false, company:this.props.company};
  },
  showEdit: function() {
    this.setState({edit:true});
  },
  editCancel: function() {
    var state = this.state
    state.edit = false
    state.editSuccess = false
    this.setState(state)
  },
  editDone: function(edited) {
    this.setState({
      company:edited,
      edit:false,
      editSuccess:true
    })
  },
  render: function() {
    var view;
    if (this.state.edit == true) {
      return <CompanyEdit editCancel={this.editCancel} company={this.state.company} editDone={this.editDone}/>
    } else {
    return <CompanyShow showEdit={this.showEdit} editSuccess={!!this.state.editSuccess} company={this.state.company}/>
    }
  }
});

var CompanyList = React.createClass({
  render: function() {
    var companyNodes = this.props.companies.map(function(company, index) {
      return (
        <Company company={company} key={company.id + index}/>        
      );
    });  
    return (
      <div className="row companyList">
        {companyNodes}
      </div>
    );
  }
});

var Beneficiary = React.createClass({
  render: function() {
    return (
      <li className="beneficiary ">
        {this.props.name}
      </li>
    );
  }
});

var Beneficiaries = React.createClass({
  render: function() {
    var beneficiaryNodes = this.props.beneficiaries.map(function(beneficiary, index) {
      return (
        <Beneficiary name={beneficiary.name} key={index}/>        
      );
    });  
    return (
      <ul className="beneficiaries list-unstyled">
        {beneficiaryNodes}
      </ul>
    );  
  }
});
ReactDOM.render(
  <CompanyBox/>,
  document.getElementById('react-app')
);