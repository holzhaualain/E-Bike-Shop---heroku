export class User  {
    constructor(name, firstname, email, pwd,type) {
        this.name = name;
        this.firstname =  firstname;
        this.email =  email;
        this.pwd =  pwd;
        this.type =  type;
        this.token =  null;
    }
}