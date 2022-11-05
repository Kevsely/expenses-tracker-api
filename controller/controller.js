const model = require("../models/model")

// post: http://localhos:8080/api/categories
async function create_Categories(req, res) {
    const Create = new model.Categories({
        type: "Investment", 
        color: "#FCBE44"
    })

    await Create.save(function(err) {
        if(!err) return res.json(Create)
        return res.status(400).json({message: `Error while creating categories ${err}`})
    })
}

// get: http://localhos:8080/api/categories
async function get_Categories(req, res) {
    let data = await model.Categories.find({})
    let filter = await data.map(v => Object.assign({}, {type: v.type, color: v.color}))
    return res.json(filter)
}

// post: http://localhos:8080/api/transactions
async function create_Transactions(req, res) {
    if (!req.body) return res.status(400).json("Post HTTP data not provided")
    let { name, type, amount } = req.body;

    const create = await new model.Transactions(
        {
            name,
            type, 
            amount,
            date: new Date()
        }
    )

    create.save(function(err) {
        if (!err) return res.json(create)
        return res.status(400).json({message: `Error while creating transaction ${err}`})
    })
}

// get: http://localhos:8080/api/transactions
async function get_Transactions(req, res) {
    let data = await model.Transactions.find({})
    return res.json(data)
}

// delete: http://localhos:8080/api/transactions
async function delete_Transactions(req, res) {
    if(!req.body) res.status(400).json({message: "Request body not found"})
    await model.Transactions.deleteOne(req.body, function(err) {
        if (!err) res.json("Record Deleted...!")
    }).clone().catch(function(err) {
        res.json("Error while deleting transaction record")
    })
}

// get: http://localhos:8080/api/labels
async function get_Labels(req, res) {

    model.Transactions.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "type",
                foreignField: "type",
                as: "categories_info"
            }
        }, 
        {
            $unwind: "$categories_info"
        }
    ]).then (result => {
        let data = result.map(v => Object.assign({}, {_id: v._id, name: v.name, type: v.type, amount: v.amount, color: v.categories_info.color}))
        res.json(data)
    }).catch(error => {
        res.status(400).json("Lookup collection error")
    })
}

module.exports = {
    create_Categories,
    get_Categories,
    create_Transactions, 
    get_Transactions, 
    delete_Transactions,
    get_Labels
}