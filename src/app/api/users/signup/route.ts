 import { connectDb } from "@/dbConfig/dbConfig";
import User from '@/models/userModel'
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs'
import {sendEmail} from  '@/helpers/mailer'

connectDb()

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json()
        const {username,email,password} = reqBody
        console.log(reqBody)

        //check if user already present
        const user = await User.findOne({email})

        if(user){
            return NextResponse.json({
                error: 'user already exist'
            },{
                status: 400
            })
        }

        //hashing krlo

        const salt = await bcryptjs.genSalt(10)
        const hashedPass = await bcryptjs.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPass
        })

        const savedUser = await newUser.save()

        console.log(savedUser)

        await sendEmail({email, emailType: "VERIFY", userId: savedUser._id})

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            savedUser
        })
        
        



    } catch (error:any) {
        return NextResponse.json({
            error: error.message
        },{
            status: 500
        })
    }
}