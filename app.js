const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash")
const app = express();
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://aditya:adirox123@cluster0.v7fbpph.mongodb.net/todolistDB?retryWrites=true&w=majority");
const itemSchema=new mongoose.Schema({
    name:String
})
const Item= mongoose.model("Item",itemSchema);
const item1=new Item({
    name:"Welcome to your todolist! "
})
const item2=new Item({
    name:"hit the + button to add a new item"
})
const item3=new Item({
    name:"<-- hit this to delete an item"
})
const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemSchema]
}
const List=mongoose.model("List",listSchema)
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded ({
    extended: true
}))
app.use(express.static("public"))
app.get("/", function (req, res) {

    Item.find(function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("inserted successfully")
                }
            })
            res.redirect("/")
        }
        else{
            res.render("list", {
                listTitle : "Today",
                newListItems:foundItems
            });
        }
    })
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName=req.body.list;
    const item=new Item({
        name:itemName
    })
    if(listName=="Today"){
        item.save();
        res.redirect("/")
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item)
            foundList.save()
            res.redirect("/"+listName)
        })
    }
    
});

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name:customListName,
                    items:defaultItems
                })
                list.save()
                res.redirect("/"+customListName)
            }else{
                res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
            }
        }
    })
    
})
app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName
    if(listName=="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err)
            }else{
                res.redirect("/")
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
})
app.get("/about",function(req,res){
    res.render("about");
})
const port=process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server started on port ${port}");
})
