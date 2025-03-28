"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`https://mlm-vrqj.onrender.com/api/get-courses?userId=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setCourses(data.recommendations || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching courses:", error);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Recommended Courses</h1>
      {loading ? (
        <p className="text-lg">Loading courses...</p>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <Card key={index} className="shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold truncate">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate">
                  {course.url}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild>
                  <a href={course.url} target="_blank" rel="noopener noreferrer">
                    Visit Course
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-lg">No courses found.</p>
      )}
    </div>
  );
}
