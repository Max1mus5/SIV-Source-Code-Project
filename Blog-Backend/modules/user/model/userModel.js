
class User {
    constructor(id, username, email, password, bio, role, urlImage,roleInstance) {
        this._id = id;
        this._username = username;
        this._email = email;
        this._password = password;
        this._bio = bio;
        this._role = role;
        this._profileImage = urlImage;
        this._roleInstance = roleInstance;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get email() {
        return this._email;
    }

    set email(value) {
        this._email = value;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }

    get bio() {
        return this._bio;
    }

    set bio(value) {
        this._bio = value;
    }

    get role() {
        return this._role;
    }

    set role(value) {
        this._role = value;
    }

    get profileImage() {
        return this._profileImage;
    }

    set profileImage(value) {
        this._profileImage = value;
    }

    get roleInstance() {
        return this._roleInstance;
    }

    /* method for view the info of the user */

    toJSON() {
        return {
            id: this._id,
            username: this._username,
            email: this._email,
            bio: this._bio,
            role: this._role,
            profileImage: this._profileImage,
            ...this._roleInstance && this._roleInstance.toJSON()
        };
    }
}

module.exports = User;
