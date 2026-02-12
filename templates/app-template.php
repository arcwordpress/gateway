<?php
/**
 * Template Name: Gateway App
 * Template Post Type: page
 * Description: A full-page application template with client-side routing support. Use this template for pages that contain GTX Router blocks.
 */

get_header();
?>

<div id="gateway-app-container" class="gateway-app-page">
	<?php
	while ( have_posts() ) :
		the_post();
		?>
		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
			<div class="entry-content">
				<?php the_content(); ?>
			</div>
		</article>
		<?php
	endwhile;
	?>
</div>

<?php
get_footer();
