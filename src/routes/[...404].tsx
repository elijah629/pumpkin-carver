import { A } from "@solidjs/router";
import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";

export default function NotFound() {
	return (
		<>
			<HttpStatusCode code={404} />
			<Title>404 Not Found</Title>
			<p>Oops! This page is not found, please carve pumpkins</p>
			<A
				href="/"
				class="font-medium underline underline-offset-4">
				(do what it said)
			</A>
		</>
	);
}
