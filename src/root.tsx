// @refresh reload
import { Suspense } from "solid-js";
import {
	Body,
	ErrorBoundary,
	FileRoutes,
	Head,
	Html,
	Meta,
	Routes,
	Scripts,
	Title
} from "solid-start";
import "./root.css";

export default function Root() {
	return (
		<Html lang="en">
			<Head>
				<Title>
						Pumpkin Carver
				</Title>

				<Meta charset="utf-8" />

				<Meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
			</Head>
			<Body class="h-full overflow-hidden">
				<Suspense>
					<ErrorBoundary>
						<Routes>
							<FileRoutes />
						</Routes>
					</ErrorBoundary>
				</Suspense>
				<Scripts />
			</Body>
		</Html>
	);
}
