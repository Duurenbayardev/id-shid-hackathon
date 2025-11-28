import connectMongoDB from "../../../libs/mongodb";
import User from "../../../models/user";
import { NextResponse } from "next/server";
import { NextRequest } from 'next/server';

interface CreateUserRequest {
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

interface UpdateTopicRequest extends CreateUserRequest {
  id: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { user, dailyScore, zoos, ymbuu, stats }: CreateUserRequest = await request.json();

    // Validate required fields
    if (!user) {
      return NextResponse.json({ error: "User field is required" }, { status: 400 });
    }

    await connectMongoDB();

    // Create user with all fields
    const result = await User.create({
      user,
      dailyScore: dailyScore || "0",
      zoos: zoos || 0,
      ymbuu: ymbuu || 0,
      stats: stats || {
        hp: 100,
        earning: 10,
        maxCapacity: 100
      }
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('POST Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    await connectMongoDB();
    const users = await User.find();
    return NextResponse.json({ users });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    await connectMongoDB();
    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "Topic deleted" }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { id, user, dailyScore, zoos, ymbuu, stats }: UpdateTopicRequest = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 });
    }

    await connectMongoDB();

    await User.findByIdAndUpdate(id, {
      user,
      dailyScore,
      zoos,
      ymbuu,
      stats
    });

    return NextResponse.json({ message: "User updated" }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}