import { verifyToken } from "../../../../libs/auth";
import connectMongoDB from "../../../../libs/mongodb";
import User from "../../../../models/user";
import { NextResponse } from "next/server";
import { NextRequest } from 'next/server';

interface UserParams {
  id: string;
}

interface UpdateTopicRequest {
  user: string;
  dailyScore: string;
  zoos: number;
  ymbuu: number;
  stats: {
    hp: number;
    earning: number;
    maxCapacity: number;
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: UserParams }
): Promise<NextResponse> {
  try {

    const { id } = params;
    // const token = request.headers.get('Authorization')
    // const decoded = verifyToken(token || '');

    // if(!decoded) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    const {
      user,
      dailyScore,
      zoos,
      ymbuu,
      stats
    }: UpdateTopicRequest = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
    }

    if (!user || !dailyScore || zoos || ymbuu === undefined || !stats) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectMongoDB();
    await User.findByIdAndUpdate(id, {
      user,
      dailyScore,
      zoos,
      ymbuu,
      stats
    });

    return NextResponse.json({ message: "Topic updated" }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: UserParams }
): Promise<NextResponse> {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
    }

    await connectMongoDB();
    const topic = await User.findOne({ _id: id });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ topic }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}