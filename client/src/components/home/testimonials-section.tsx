import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, VerifiedIcon, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Review {
	id: number;
	rating: number;
	title: string;
	content: string;
	isVerifiedPurchase: boolean;
	createdAt: string;
	user: {
		discordUsername: string;
		discordAvatar: string;
	};
	mod: {
		title: string;
	};
}

const TestimonialsSection = () => {
	// Fetch recent high-rated reviews across all mods
	const { data: reviewsData, isLoading } = useQuery({
		queryKey: ["/api/reviews/featured"],
		queryFn: () => fetch("/api/reviews/featured").then(res => res.json()),
	});

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.3,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
	};

	if (isLoading) {
		return (
			<section className="py-20 relative overflow-hidden">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<h2 className="text-3xl md:text-4xl font-display font-bold text-white">
							What Our{" "}
							<span className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
								Users Say
							</span>
						</h2>
						<p className="text-neutral mt-3">
							Real reviews from verified customers
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[1, 2, 3].map((i) => (
							<div key={i} className="bg-slate-800/50 rounded-2xl h-[300px] animate-pulse backdrop-blur-sm"></div>
						))}
					</div>
				</div>
			</section>
		);
	}

	const reviews = reviewsData?.reviews || [];

	if (reviews.length === 0) {
		return (
			<section className="py-20 relative overflow-hidden">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-3xl mx-auto">
						<h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
							What Our{" "}
							<span className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
								Users Say
							</span>
						</h2>
						<p className="text-neutral">
							Be the first to leave a review and help others discover amazing mods!
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-20 relative overflow-hidden">
			<div className="container mx-auto px-4">
				<motion.div
					className="text-center max-w-3xl mx-auto mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-3xl md:text-4xl font-display font-bold text-white">
						What Our{" "}
						<span className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
							Users Say
						</span>
					</h2>
					<p className="text-neutral mt-3">
						Real reviews from verified customers who love our mods
					</p>
				</motion.div>

				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					{reviews.slice(0, 6).map((review: Review, index: number) => (
						<motion.div
							key={review.id}
							variants={itemVariants}
							whileHover={{
								y: -15,
								scale: 1.03,
								rotateY: 5,
								rotateX: 3,
								transition: { duration: 0.4, ease: "easeOut" },
							}}
							whileTap={{ scale: 0.97 }}
							transition={{ duration: 0.3 }}
							className="card-3d"
						>
							<Card className="bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-green-900/30 transition-all duration-500 hover:border-purple-600/60 hover:shadow-2xl hover:shadow-purple-600/25 relative overflow-hidden group btn-magnetic h-full">
								{/* Animated background gradient */}
								<div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

								{/* Floating particles */}
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
									<div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
									<div className="absolute bottom-6 left-6 w-1 h-1 bg-green-400 rounded-full animate-ping delay-500"></div>
									<div className="absolute top-1/2 right-6 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-700"></div>
								</div>

								<CardContent className="p-0 relative z-10 h-full flex flex-col">
									<motion.div
										className="flex justify-between items-start mb-4"
										whileHover={{ x: 3 }}
										transition={{ duration: 0.2 }}
									>
										<div className="flex items-center flex-1">
											<motion.div
												className="w-12 h-12 rounded-full overflow-hidden mr-4 ring-2 ring-transparent group-hover:ring-green-500/50 transition-all duration-300"
												whileHover={{ scale: 1.1, rotate: 5 }}
											>
												<Avatar>
													<AvatarImage
														src={review.user.discordAvatar}
														alt={review.user.discordUsername}
													/>
													<AvatarFallback className="bg-gradient-to-br from-green-600 to-purple-600 text-white font-bold">
														<User className="h-5 w-5" />
													</AvatarFallback>
												</Avatar>
											</motion.div>
											<div className="flex-1">
												<motion.h4
													className="font-display font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 text-sm"
													whileHover={{ x: 2 }}
												>
													{review.user.discordUsername}
												</motion.h4>
												<div className="flex items-center gap-2">
													<motion.div
														className="flex items-center"
														whileHover={{ scale: 1.1 }}
													>
														{[...Array(5)].map((_, i) => (
															<motion.div
																key={i}
																whileHover={{
																	scale: 1.3,
																	rotate: 15,
																	transition: { delay: i * 0.1 },
																}}
															>
																<Star
																	className={`h-3 w-3 ${
																		i < review.rating
																			? "text-yellow-400 fill-current"
																			: "text-slate-500"
																	} hover:text-yellow-300 transition-colors duration-200`}
																/>
															</motion.div>
														))}
													</motion.div>
													{review.isVerifiedPurchase && (
														<Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs h-5">
															<VerifiedIcon className="h-2 w-2 mr-1" />
															Verified
														</Badge>
													)}
												</div>
											</div>
										</div>

										{/* Quote icon with animation */}
										<motion.div
											className="text-green-600/30 text-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ml-2"
											whileHover={{ scale: 1.2, rotate: 180 }}
											initial={{ rotate: 0 }}
										>
											<i className="fas fa-quote-right"></i>
										</motion.div>
									</motion.div>

									<div className="flex-1 flex flex-col">
										<motion.h5
											className="font-medium text-white mb-2 text-sm group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300"
											whileHover={{ x: 2 }}
										>
											{review.title}
										</motion.h5>

										<motion.p
											className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300 text-sm flex-1"
											whileHover={{ x: 5 }}
										>
											{review.content.length > 120 
												? `${review.content.substring(0, 120)}...` 
												: review.content
											}
										</motion.p>

										<div className="mt-4 pt-3 border-t border-slate-700/50">
											<motion.div
												className="flex items-center justify-between"
												whileHover={{ x: 2 }}
											>
												<div className="text-xs text-slate-400">
													{review.mod.title}
												</div>
												<div className="text-xs text-slate-500">
													{format(new Date(review.createdAt), 'MMM yyyy')}
												</div>
											</motion.div>
										</div>
									</div>
								</CardContent>

								{/* Shimmer effect */}
								<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
							</Card>
						</motion.div>
					))}
				</motion.div>

				{reviews.length > 6 && (
					<motion.div
						className="text-center mt-12"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<p className="text-slate-400 text-sm">
							Showing {Math.min(6, reviews.length)} of {reviews.length} featured reviews
						</p>
					</motion.div>
				)}
			</div>
		</section>
	);
};

export default TestimonialsSection;
