const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "Brown123",
    database: "bamazon"
})

connection.connect(function (err) {
    if (err) throw (err);
    console.log("connection successful!")
    makeTable();
});

var makeTable = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].itemid + " || " + res[i].productname + " || " +
                res[i].departmentname + " || " + res[i].price + " || " + res[i].stockquantity + "\n"
            );
        }
        promptCustomers(res);
    })
}

var promptCustomers = function (res) {
    inquirer.prompt([{
        type: 'input',
        name: 'choice',
        message: "Select item(s) you would like to purchase [Quit with Q]"
    }]).then(function (answer) {
        var correct = false;
        if (answer.choice.toUpperCase() == "Q") {
            process.exit();
        }
        for (var i = 0; i < res.length; i++) {
            if (res[i].productname == answer.choice) {
                correct = true;
                var product = answer.choice;
                var id = i;
                inquirer.prompt({
                    type: 'input',
                    name: "quantity",
                    message: "Select the amount you would like to purchase",
                    validate: function (value) {
                        if (isNaN(value) == false) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }

                }).then(function (answer) {
                    if ((res[id].stockquantity - answer.quantity) > 0) {
                        connection.query("UPDATE products SET stockquantity = '" + (res[id].stockquantity - answer.quantity) + "' WHERE productname = '" +
                            product + "'", function (err, res2) {
                                console.log("Item Purchased!");
                                makeTable();
                            })
                    } else {
                        console.log("Not a valid selection");
                        promptCustomers(res);
                    }
                })
            }
        }
        if (i == res.length && correct == false) {
            console.log("Not a valid selection!")
        }
    })

}