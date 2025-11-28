import EditTopicForm from "../../../components/EditTopicForm";

const getTopicById = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch topics");
    }

    return res.json();
  } catch (error) {
    console.log("Error loading topics: ", error);
  }
};

export default async function EditTopic({ params }) {
  const { id } = params;
  const users = await getTopicById(id);
  const { topic } = users;
  const {user,zoos,ymbuu,stats,dailyScore}=topic;
  return (
    <EditTopicForm
      id={id}
      dailyScore={dailyScore}
      user={user}
      zoos={zoos}
      ymbuu={ymbuu}
      stats={stats}
    />
  );
}