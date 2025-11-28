import connectMongoDB from "../../../libs/mongodb";
import User from "../../../models/user";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
    try {
        await connectMongoDB();
        
        const users = await User.aggregate([
            {
                $addFields: {
                    dailyScoreNum: {
                        $convert: {
                            input: "$dailyScore",
                            to: "double",
                            onError: 0,
                            onNull: 0
                        }
                    }
                }
            },
            {
                $sort: { dailyScoreNum: -1 }
            },
            {
                $project: {
                    dailyScoreNum: 0 // Remove temporary field
                }
            }
        ]);

        return NextResponse.json({ users });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}