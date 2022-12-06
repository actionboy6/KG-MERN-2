const { AuthenticationError } = require('apollo-server-express')
const { User } = require('../models')
const bookSchema = require('../models/Book')
const { signToken } = require('../utils/auth')
const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            const userData = await User.findOne({
                _id: context.user._id
            })
            return userData
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const newUser = await User.create(args)
            const token = signToken(newUser)
            return {token, newUser};
        },
        saveBook: async (parent, {bookData}, context) => {
            //const saveBook = await bookSchema.findOne(args)
            if(context.user)
            {
                const userData = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData }},
                    { new: true }
                );

                return userData;
            }

        },
        removeBook: async (parent, {bookId}, context) => {
            //const deleteBook = await bookSchema.deleteBook(args)
            if(context.user)
            {
                const userData = await User.findOneAndUpdate(
                    { _id: context.user._id},
                    {$pull: { savedBooks: {bookId}}},
                    { new: true }
                );

                return userData;
            }
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email });

            if(!user)
            {
                throw new AuthenticationError("Incorrect Username");
                //alert("Incorrect credentials");
            }

            const pwd = await user.isCorrectPassword(password);

            if(!pwd)
            {
                throw new AuthenticationError("Incorrect Username");
            }

            const token = signToken(user);
            return {token, user};

        }
    }
}

module.exports = resolvers